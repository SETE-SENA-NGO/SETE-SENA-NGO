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
  'blockquote',
  'figcaption',
].join(',')

const TRANSLATABLE_ATTRIBUTES = [
  'alt',
  'aria-label',
  'placeholder',
  'title',
] as const

const originalTextNodes = new WeakMap<Text, string>()
const translatedTextNodes = new Set<Text>()
const originalElements = new WeakMap<Element, string>()
const translatedElements = new Set<Element>()
const originalAttributes = new WeakMap<Element, Map<string, string>>()
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
        'input',
        'textarea',
        'select',
        'option',
        '[contenteditable="true"]',
        '[data-no-localize]',
        '.admin-top-bar',
        '.confirm-dialog',
        '.toast-region',
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

function restore(root: Element) {
  applying = true

  for (const element of translatedElements) {
    if (!element.isConnected || !root.contains(element)) continue
    const originalHtml = originalElements.get(element)
    if (originalHtml !== undefined) {
      element.innerHTML = originalHtml
    }
  }

  for (const textNode of translatedTextNodes) {
    if (!textNode.isConnected || !root.contains(textNode.parentElement))
      continue
    const originalText = originalTextNodes.get(textNode)
    if (originalText !== undefined) {
      textNode.nodeValue = originalText
    }
  }

  for (const element of translatedAttributeElements) {
    if (!element.isConnected || !root.contains(element)) continue
    const attributes = originalAttributes.get(element)
    attributes?.forEach((value, name) => {
      element.setAttribute(name, value)
    })
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

    const key = normalizeTranslationKey(element.textContent)
    const translated = translateContentText(key, locale)
    if (translated === key) return

    originalElements.set(element, element.innerHTML)
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
    translatedTextNodes.add(textNode)
    textNode.nodeValue = translated
  })
}

function translateAttributes(root: Element, locale: SupportedLocale) {
  root.querySelectorAll('*').forEach((element) => {
    if (isSkippableElement(element)) return

    TRANSLATABLE_ATTRIBUTES.forEach((attributeName) => {
      const value = element.getAttribute(attributeName)
      if (!value) return

      const translated = translateContentText(value, locale)
      if (translated === value) return

      storeOriginalAttribute(element, attributeName, value)
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
    scheduleApply(currentLocale(), isAdminRoute.value)
  }

  onMounted(() => {
    observer = new MutationObserver(() => {
      if (applying) return
      scheduleApply(currentLocale(), isAdminRoute.value)
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
