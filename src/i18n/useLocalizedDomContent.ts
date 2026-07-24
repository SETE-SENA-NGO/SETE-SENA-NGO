import { nextTick, onMounted, onUnmounted, watch, type ComputedRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import {
  normalizeTranslationKey,
  translateContentText,
} from '@/i18n/contentTranslations'
import type { SupportedLocale } from '@/i18n'

const TRANSLATABLE_SELECTOR = [
  'h1',
  'h2',
  'h3',
  'h4',
  'p',
  'a',
  'button',
  'span',
  'strong',
  'small',
  'li',
  'dt',
  'dd',
  'label',
  'legend',
  'blockquote',
  'figcaption',
  'summary',
  'th',
  'td',
  "[class*='title']",
  "[class*='heading']",
  "[class*='headline']",
  "[class*='subtitle']",
  "[class*='label']",
  "[class*='eyebrow']",
  "[class*='kicker']",
  "[class*='name']",
  "[class*='role']",
  "[class*='caption']",
  "[class*='badge']",
].join(',')

const TRANSLATABLE_ATTRIBUTES = [
  'alt',
  'aria-label',
  'placeholder',
  'title',
] as const

const originalTextNodes = new WeakMap<Text, string>()
const translatedTextNodeValues = new WeakMap<Text, string>()
const translatedTextNodes = new Set<Text>()
const originalElements = new WeakMap<Element, string>()
const translatedElementValues = new WeakMap<Element, string>()
const translatedElements = new Set<Element>()
const originalAttributes = new WeakMap<Element, Map<string, string>>()
const translatedAttributes = new WeakMap<Element, Map<string, string>>()
const translatedAttributeElements = new Set<Element>()

let observer: MutationObserver | null = null
let scheduledFrame = 0
let applying = false
let originalDocumentTitle = ''
let translatedDocumentTitle = ''

function getRoot() {
  return document.querySelector('#app')
}

function isSkippableElement(element: Element | null) {
  if (!element) return true

  return Boolean(
    element.closest(
      [
        'script',
        'style',
        'svg',
        '.material-icons',
        '.material-icons-outlined',
        'input',
        'textarea',
        '[aria-hidden="true"]',
        '[contenteditable="true"]',
        '[data-no-localize]',
      ].join(','),
    ),
  )
}

function isSkippableAttributeElement(element: Element | null) {
  if (!element) return true

  return Boolean(
    element.closest(
      [
        'script',
        'style',
        'svg',
        '[contenteditable="true"]',
        '[data-no-localize]',
      ].join(','),
    ),
  )
}

function storeOriginalAttribute(
  element: Element,
  attributeName: string,
  value: string,
) {
  const map = originalAttributes.get(element) ?? new Map<string, string>()
  if (!map.has(attributeName)) {
    map.set(attributeName, value)
    originalAttributes.set(element, map)
  }
}

function storeTranslatedAttribute(
  element: Element,
  attributeName: string,
  value: string,
) {
  const map = translatedAttributes.get(element) ?? new Map<string, string>()
  map.set(attributeName, value)
  translatedAttributes.set(element, map)
}

function canReplaceGroupedElement(element: Element) {
  if (!element.children.length) return false
  if (['A', 'BUTTON'].includes(element.tagName)) return false

  return !element.querySelector(
    [
      'a',
      'button',
      'svg',
      'img',
      'picture',
      'video',
      'canvas',
      'input',
      'textarea',
      'select',
      'option',
      '[contenteditable="true"]',
      '[data-no-localize]',
    ].join(','),
  )
}

function getElementTranslationKey(element: Element) {
  const parts: string[] = []

  function collectText(node: Node) {
    if (node.nodeType === Node.TEXT_NODE) {
      parts.push(node.nodeValue ?? '')
      return
    }

    if (!(node instanceof Element)) return

    if (node.tagName === 'BR') {
      parts.push(' ')
      return
    }

    node.childNodes.forEach(collectText)
  }

  collectText(element)
  return normalizeTranslationKey(parts.join(''))
}

function restore(root: Element) {
  applying = true

  for (const element of translatedElements) {
    if (!element.isConnected || !root.contains(element)) continue
    const originalHtml = originalElements.get(element)
    const translatedText = translatedElementValues.get(element)
    if (originalHtml !== undefined) {
      if (!translatedText || element.textContent === translatedText) {
        element.innerHTML = originalHtml
      }

      originalElements.delete(element)
      translatedElementValues.delete(element)
    }
  }

  for (const textNode of translatedTextNodes) {
    if (!textNode.isConnected || !root.contains(textNode.parentElement))
      continue
    const originalText = originalTextNodes.get(textNode)
    const translatedText = translatedTextNodeValues.get(textNode)
    if (originalText !== undefined) {
      if (!translatedText || textNode.nodeValue === translatedText) {
        textNode.nodeValue = originalText
      }

      originalTextNodes.delete(textNode)
      translatedTextNodeValues.delete(textNode)
    }
  }

  for (const element of translatedAttributeElements) {
    if (!element.isConnected || !root.contains(element)) continue
    const attributes = originalAttributes.get(element)
    const translatedAttributeMap = translatedAttributes.get(element)
    attributes?.forEach((value, name) => {
      const translatedValue = translatedAttributeMap?.get(name)
      if (!translatedValue || element.getAttribute(name) === translatedValue) {
        element.setAttribute(name, value)
      }
    })
    originalAttributes.delete(element)
    translatedAttributes.delete(element)
  }

  translatedElements.clear()
  translatedTextNodes.clear()
  translatedAttributeElements.clear()
  applying = false
}

function translateElementText(root: Element, locale: SupportedLocale) {
  const elements = root.querySelectorAll(TRANSLATABLE_SELECTOR)

  elements.forEach((element) => {
    if (isSkippableElement(element)) return
    if (!element.textContent) return
    if (element.children.length > 0 && !canReplaceGroupedElement(element))
      return

    const key = getElementTranslationKey(element)
    const translated = translateContentText(key, locale)
    if (translated === key) return

    originalElements.set(element, element.innerHTML)
    translatedElementValues.set(element, translated)
    translatedElements.add(element)
    element.textContent = translated
  })
}

function translateTextNodes(root: Element, locale: SupportedLocale) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  const nodes: Text[] = []

  while (walker.nextNode()) {
    const textNode = walker.currentNode as Text
    nodes.push(textNode)
  }

  nodes.forEach((textNode) => {
    const parent = textNode.parentElement
    if (isSkippableElement(parent)) return
    if (!textNode.nodeValue || !normalizeTranslationKey(textNode.nodeValue))
      return

    const originalText = originalTextNodes.get(textNode) ?? textNode.nodeValue
    const translated = translateContentText(originalText, locale)

    if (translated === originalText) return

    originalTextNodes.set(textNode, originalText)
    translatedTextNodeValues.set(textNode, translated)
    translatedTextNodes.add(textNode)
    textNode.nodeValue = translated
  })
}

function translateAttributes(root: Element, locale: SupportedLocale) {
  root.querySelectorAll('*').forEach((element) => {
    if (isSkippableAttributeElement(element)) return

    TRANSLATABLE_ATTRIBUTES.forEach((attributeName) => {
      const value = element.getAttribute(attributeName)
      if (!value) return

      const translated = translateContentText(value, locale)
      if (translated === value) return

      storeOriginalAttribute(element, attributeName, value)
      storeTranslatedAttribute(element, attributeName, translated)
      translatedAttributeElements.add(element)
      element.setAttribute(attributeName, translated)
    })
  })
}

function apply(root: Element, locale: SupportedLocale, disabled: boolean) {
  if (scheduledFrame) {
    cancelAnimationFrame(scheduledFrame)
    scheduledFrame = 0
  }

  restore(root)
  restoreDocumentTitle()

  if (disabled || locale !== 'kh') return

  applying = true
  translateDocumentTitle(locale)
  translateElementText(root, locale)
  translateTextNodes(root, locale)
  translateAttributes(root, locale)
  applying = false
}

function translateDocumentTitle(locale: SupportedLocale) {
  const sourceTitle =
    document.title === translatedDocumentTitle && originalDocumentTitle
      ? originalDocumentTitle
      : document.title
  const translated = translateContentText(sourceTitle, locale)

  if (translated === sourceTitle) return

  originalDocumentTitle = sourceTitle
  translatedDocumentTitle = translated
  document.title = translated
}

function restoreDocumentTitle() {
  if (!originalDocumentTitle || document.title !== translatedDocumentTitle)
    return

  document.title = originalDocumentTitle
  originalDocumentTitle = ''
  translatedDocumentTitle = ''
}

function scheduleApply(locale: SupportedLocale, disabled: boolean) {
  const root = getRoot()
  if (!root) return

  if (scheduledFrame) cancelAnimationFrame(scheduledFrame)

  scheduledFrame = requestAnimationFrame(() => {
    scheduledFrame = 0
    apply(root, locale, disabled)
  })
}

export function useLocalizedDomContent(isAdminRoute: ComputedRef<boolean>) {
  const { locale } = useI18n()
  const route = useRoute()

  function currentLocale() {
    return locale.value === 'kh' ? 'kh' : 'en'
  }

  async function applyAfterRender() {
    await nextTick()
    scheduleApply(currentLocale(), false)
  }

  onMounted(() => {
    observer = new MutationObserver(() => {
      if (applying) return
      scheduleApply(currentLocale(), false)
    })

    const root = getRoot()
    if (root) {
      observer.observe(root, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeFilter: [...TRANSLATABLE_ATTRIBUTES],
      })
    }

    void applyAfterRender()
  })

  onUnmounted(() => {
    observer?.disconnect()
    observer = null

    const root = getRoot()
    if (root) restore(root)

    if (scheduledFrame) {
      cancelAnimationFrame(scheduledFrame)
      scheduledFrame = 0
    }
  })

  watch([() => locale.value, () => route.fullPath, isAdminRoute], () => {
    void applyAfterRender()
  })
}
