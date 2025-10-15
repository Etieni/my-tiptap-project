import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import Highlight from '@tiptap/extension-highlight'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import FontFamily from '@tiptap/extension-font-family'

// наши расширения
import FontSize from './extensions/fontSize'
import LineHeight from './extensions/lineHeight'

// Tabler Icons
import {
  IconBold,
  IconItalic,
  IconUnderline,
  IconStrikethrough,
  IconLink,
  IconList,
  IconListNumbers,
  IconQuote,
  IconArrowBackUp,
  IconArrowForwardUp,
  IconAlignLeft,
  IconAlignCenter,
  IconAlignRight,
  IconAlignJustified,
  IconSubscript,
  IconSuperscript,
  IconEraser,
  IconIndentIncrease,
  IconIndentDecrease,
  IconLineHeight,
  IconMinus,
  IconPlus,
  IconChevronDown,
  IconCopyright,
} from '@tabler/icons-react'

// Phosphor (для маркера)
import { Highlighter } from '@phosphor-icons/react'

import './ContractEditor.css'
import './ToolbarThemes.css'
import './ToolbarGlassFix.css'
import './PlateLayout.css'

const FONTS = [
  { label: 'Inter', value: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif' },
  { label: 'Noto Sans', value: '"Noto Sans", system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif' },
  { label: 'Noto Serif', value: '"Noto Serif", Georgia, Times, serif' },
  { label: 'Roboto', value: 'Roboto, system-ui, -apple-system, Segoe UI, Arial, sans-serif' },
  { label: 'Roboto Mono', value: '"Roboto Mono", ui-monospace, SFMono-Regular, Menlo, monospace' },
  { label: 'Monomakh', value: 'Monomakh, serif' },
]

const FONT_SIZES = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px']
const LINE_HEIGHTS = [
  { label: '1 (плотно)', value: '1' },
  { label: '1.15', value: '1.15' },
  { label: '1.35', value: '1.35' },
  { label: '1.5', value: '1.5' },
  { label: '1.75', value: '1.75' },
  { label: '2 (разряжено)', value: '2' },
]

const HIGHLIGHT_COLORS = ['#fff59d', '#bbf7d0', '#bfdbfe', '#fde68a', '#fecaca', '#e9d5ff', '#c7d2fe', '#f5d0fe']

export default function ContractEditor() {
  const [showHighlightColors, setShowHighlightColors] = useState(false)
  const [showSpecials, setShowSpecials] = useState(false)
  const [showLHSelect, setShowLHSelect] = useState(false)
  const [theme, setTheme] = useState('toolbar--minimal')

  // Кастомные dropdown'ы
  const [showHeadingMenu, setShowHeadingMenu] = useState(false)
  const [showFontMenu, setShowFontMenu] = useState(false)
  const [showSizeMenu, setShowSizeMenu] = useState(false)

  const headingCsRef = useRef(null)
  const headingMenuRef = useRef(null)
  const fontCsRef = useRef(null)
  const fontMenuRef = useRef(null)
  const sizeCsRef = useRef(null)
  const sizeMenuRef = useRef(null)

  const lhSelectRef = useRef(null)

  const extensions = useMemo(
    () => [
      StarterKit.configure({
        horizontalRule: false,
        link: false,
        underline: false,
      }),
      TextStyle,
      FontSize,
      LineHeight,
      Highlight.configure({ multicolor: true }),
      Underline,
      Link.configure({
        autolink: true,
        linkOnPaste: true,
        openOnClick: true,
        HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
      }),
      Subscript,
      Superscript,
      FontFamily,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: 'Введите текст договора…' }),
    ],
    [],
  )

  const editor = useEditor({
    extensions,
    content: '<p>Введите текст договора…</p>',
  })

  useEffect(() => {
    if (!editor) return
    editor.chain().setFontFamily(FONTS[0].value).setFontSize('16px').setLineHeight('1.5').run()
  }, [editor])

  // Форсим перерисовку для актуальных значений в триггерах
  const [, forceUpdate] = useState(0)
  useEffect(() => {
    if (!editor) return
    const rerender = () => forceUpdate(v => v + 1)
    editor.on('selectionUpdate', rerender)
    editor.on('transaction', rerender)
    return () => {
      editor.off('selectionUpdate', rerender)
      editor.off('transaction', rerender)
    }
  }, [editor])

  // Клик вне — закрыть меню
  useEffect(() => {
    const onDocDown = (e) => {
      if (headingCsRef.current && !headingCsRef.current.contains(e.target)) setShowHeadingMenu(false)
      if (fontCsRef.current && !fontCsRef.current.contains(e.target)) setShowFontMenu(false)
      if (sizeCsRef.current && !sizeCsRef.current.contains(e.target)) setShowSizeMenu(false)
    }
    document.addEventListener('mousedown', onDocDown)
    return () => document.removeEventListener('mousedown', onDocDown)
  }, [])

  if (!editor) return <div className="ed-loading">Загрузка редактора…</div>

  const isActive = (name, attrs) => editor.isActive(name, attrs)
  const isAlign = (value) => editor.isActive({ textAlign: value })
  const chainMaybeFocus = () => (editor.isFocused ? editor.chain().focus() : editor.chain())

  const setLinkCmd = () => {
    const prev = editor.getAttributes('link').href || ''
    const url = window.prompt('Вставьте ссылку', prev)
    if (url === null) return
    if (url === '') return chainMaybeFocus().unsetLink().run()
    chainMaybeFocus().setLink({ href: url }).run()
  }

  const insertSpecialChar = (ch) => chainMaybeFocus().insertContent(ch).run()
  const setFontSizeCmd = (size) => chainMaybeFocus().setFontSize(size).run()
  const setFont = (family) =>
    family ? chainMaybeFocus().setFontFamily(family).run() : chainMaybeFocus().unsetFontFamily().run()
  const setLH = (lh) => chainMaybeFocus().setLineHeight(lh).run()

  const getCurrentLH = () => {
    const p = editor.getAttributes('paragraph')?.lineHeight
    const h = editor.getAttributes('heading')?.lineHeight
    return p || h || '1.5'
  }

  // Текущее состояние для триггеров
  const currentHeadingValue =
    isActive('heading', { level: 1 }) ? 'h1' :
    isActive('heading', { level: 2 }) ? 'h2' :
    isActive('heading', { level: 3 }) ? 'h3' : 'p'

  const HEADING_OPTIONS = [
    { value: 'p', label: 'Параграф' },
    { value: 'h1', label: 'Заголовок 1' },
    { value: 'h2', label: 'Заголовок 2' },
    { value: 'h3', label: 'Заголовок 3' },
  ]
  const currentHeadingLabel = HEADING_OPTIONS.find(o => o.value === currentHeadingValue)?.label ?? 'Параграф'

  const currentFontValue = editor.getAttributes('textStyle')?.fontFamily || FONTS[0].value
  const currentFont = FONTS.find(f => f.value === currentFontValue) || FONTS[0]

  const currentFontSize = editor.getAttributes('textStyle')?.fontSize || '16px'
  const currentFontSizeNum = parseInt(String(currentFontSize).replace('px', ''), 10) || 16

  // Применение опций
  const applyHeading = (v) => {
    if (v === 'p') chainMaybeFocus().setParagraph().run()
    if (v === 'h1') chainMaybeFocus().toggleHeading({ level: 1 }).run()
    if (v === 'h2') chainMaybeFocus().toggleHeading({ level: 2 }).run()
    if (v === 'h3') chainMaybeFocus().toggleHeading({ level: 3 }).run()
    setShowHeadingMenu(false)
  }
  const applyFont = (v) => { setFont(v); setShowFontMenu(false) }
  const applyFontSize = (v) => { setFontSizeCmd(v); setShowSizeMenu(false) }

  // Инкремент/декремент размера
  const sizeIndex = FONT_SIZES.indexOf(String(currentFontSize).endsWith('px') ? String(currentFontSize) : `${currentFontSizeNum}px`)
  const decSize = () => {
    if (sizeIndex > 0) setFontSizeCmd(FONT_SIZES[sizeIndex - 1])
    else setFontSizeCmd(FONT_SIZES[0])
  }
  const incSize = () => {
    if (sizeIndex >= 0 && sizeIndex < FONT_SIZES.length - 1) setFontSizeCmd(FONT_SIZES[sizeIndex + 1])
    else setFontSizeCmd(FONT_SIZES[FONT_SIZES.length - 1])
  }

  // Навигация клавиатурой
  const onTriggerKeyOpen = (openSetter) => (e) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      openSetter(true)
    }
  }
  const onMenuKeyNav = (menuRef, querySel = '.cs-option') => (e) => {
    const items = Array.from(menuRef.current?.querySelectorAll(querySel) || [])
    const idx = items.indexOf(document.activeElement)
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      items[Math.min((idx >= 0 ? idx + 1 : 0), items.length - 1)]?.focus()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      items[Math.max((idx >= 0 ? idx - 1 : items.length - 1), 0)]?.focus()
    } else if (e.key === 'Home') {
      e.preventDefault(); items[0]?.focus()
    } else if (e.key === 'End') {
      e.preventDefault(); items[items.length - 1]?.focus()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      (menuRef.current?.previousElementSibling)?.focus()
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      document.activeElement?.click()
    }
  }

  const openLHSelect = () => {
    setShowLHSelect(true)
    requestAnimationFrame(() => {
      const sel = lhSelectRef.current
      if (!sel) return
      sel.value = getCurrentLH()
      sel.focus({ preventScroll: true })
      if (typeof sel.showPicker === 'function') sel.showPicker()
      else sel.click()
    })
  }
  const closeLHSelect = () => setShowLHSelect(false)

  return (
    <div className="editor-wrap">
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
        <label style={{ fontSize: 13, color: '#6b7280' }}>Тема:</label>
        <select className="select" style={{ height: 32 }} value={theme} onChange={(e) => setTheme(e.target.value)}>
          <option value="toolbar--minimal">Minimal</option>
          <option value="toolbar--segmented">Segmented</option>
          <option value="toolbar--glass">Glass</option>
        </select>
      </div>

      <div className={`toolbar plate-toolbar ${theme}`}>
        {/* Undo/Redo */}
        <div className="plate-group">
          <button className="btn" onClick={() => chainMaybeFocus().undo().run()} title="Отменить">
            <IconArrowBackUp size={18} stroke={1.6} />
          </button>
          <button className="btn" onClick={() => chainMaybeFocus().redo().run()} title="Повторить">
            <IconArrowForwardUp size={18} stroke={1.6} />
          </button>
          <button className="btn" onClick={() => chainMaybeFocus().clearNodes().unsetAllMarks().run()} title="Очистить форматирование">
            <IconEraser size={18} stroke={1.6} />
          </button>
        </div>

        {/* Заголовок, Шрифт, Размер */}
        <div className="plate-group">
          {/* Заголовок — узкое меню + предпросмотр размеров */}
          <div className="custom-select cs-narrow" ref={headingCsRef}>
            <button
              type="button"
              className="cs-trigger"
              aria-haspopup="listbox"
              aria-expanded={showHeadingMenu}
              aria-controls="cs-menu-heading"
              onClick={() => setShowHeadingMenu((v) => !v)}
              onKeyDown={onTriggerKeyOpen(setShowHeadingMenu)}
              title="Параграф/Заголовок"
            >
              {currentHeadingLabel}
              <span className="arrow" aria-hidden="true">
                <IconChevronDown size={14} stroke={2} />
              </span>
            </button>
            {showHeadingMenu && (
              <ul
                id="cs-menu-heading"
                className="cs-menu"
                role="listbox"
                tabIndex={-1}
                ref={headingMenuRef}
                onKeyDown={onMenuKeyNav(headingMenuRef)}
              >
                {HEADING_OPTIONS.map(opt => (
                  <li
                    key={opt.value}
                    className="cs-option"
                    role="option"
                    data-value={opt.value}
                    aria-selected={currentHeadingValue === opt.value ? 'true' : 'false'}
                    tabIndex={-1}
                    onClick={() => applyHeading(opt.value)}
                  >
                    {opt.label}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Шрифт — узкое меню, опции своим font-family */}
          <div className="custom-select cs-narrow" ref={fontCsRef}>
            <button
              type="button"
              className="cs-trigger"
              aria-haspopup="listbox"
              aria-expanded={showFontMenu}
              aria-controls="cs-menu-font"
              onClick={() => setShowFontMenu(v => !v)}
              onKeyDown={onTriggerKeyOpen(setShowFontMenu)}
              title="Шрифт"
              style={{ fontFamily: currentFont.value }}
            >
              {currentFont.label}
              <span className="arrow" aria-hidden="true">
                <IconChevronDown size={14} stroke={2} />
              </span>
            </button>
            {showFontMenu && (
              <ul
                id="cs-menu-font"
                className="cs-menu"
                role="listbox"
                tabIndex={-1}
                ref={fontMenuRef}
                onKeyDown={onMenuKeyNav(fontMenuRef)}
              >
                {FONTS.map(f => (
                  <li
                    key={f.label}
                    className="cs-option"
                    role="option"
                    data-value={f.value}
                    aria-selected={currentFont.value === f.value ? 'true' : 'false'}
                    tabIndex={-1}
                    onClick={() => applyFont(f.value)}
                    style={{ fontFamily: f.value }}
                  >
                    {f.label}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Размер — segmented control */}
          <div className="fs-control" ref={sizeCsRef}>
            <button
              type="button"
              className="fs-seg fs-dropdown"
              title="Выбрать размер"
              aria-haspopup="listbox"
              aria-expanded={showSizeMenu}
              aria-controls="cs-menu-size"
              onClick={() => setShowSizeMenu(v => !v)}
              onKeyDown={onTriggerKeyOpen(setShowSizeMenu)}
            >
              <IconChevronDown size={14} stroke={2} />
            </button>
            <button type="button" className="fs-seg" title="Меньше" onClick={decSize}>
              <IconMinus size={16} stroke={2} />
            </button>
            <div className="fs-seg fs-value" aria-live="polite" title="Текущий размер">
              {currentFontSizeNum}
            </div>
            <button type="button" className="fs-seg" title="Больше" onClick={incSize}>
              <IconPlus size={16} stroke={2} />
            </button>

            {showSizeMenu && (
              <ul
                id="cs-menu-size"
                className="cs-menu"
                role="listbox"
                tabIndex={-1}
                ref={sizeMenuRef}
                onKeyDown={onMenuKeyNav(sizeMenuRef)}
              >
                {FONT_SIZES.map(s => (
                  <li
                    key={s}
                    className="cs-option"
                    role="option"
                    data-value={s}
                    aria-selected={String(currentFontSize).startsWith(s) ? 'true' : 'false'}
                    tabIndex={-1}
                    onClick={() => applyFontSize(s)}
                  >
                    {s}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Межстрочный интервал — оставляем нативный селект во всплывашке */}
          <div className="group" style={{ position: 'relative' }}>
            <button
              className="btn"
              onClick={openLHSelect}
              title="Межстрочный интервал"
              aria-haspopup="listbox"
              aria-expanded={showLHSelect}
            >
              <IconLineHeight size={18} stroke={1.6} />
            </button>
            {showLHSelect && (
              <select
                ref={lhSelectRef}
                className="select"
                defaultValue={getCurrentLH()}
                onChange={(e) => { setLH(e.target.value); closeLHSelect() }}
                onBlur={closeLHSelect}
                onKeyDown={(e) => { if (e.key === 'Escape') closeLHSelect() }}
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  left: 0,
                  zIndex: 1000,
                  width: 160,
                  height: 34,
                }}
              >
                {LINE_HEIGHTS.map(lh => (
                  <option key={lh.value} value={lh.value}>{lh.label}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div className="plate-group">
          <button className={`btn${isActive('bold') ? ' active' : ''}`} onClick={() => chainMaybeFocus().toggleBold().run()} title="Жирный">
            <IconBold size={18} stroke={2.4} />
          </button>
          <button className={`btn${isActive('italic') ? ' active' : ''}`} onClick={() => chainMaybeFocus().toggleItalic().run()} title="Курсив">
            <IconItalic size={18} stroke={1.6} />
          </button>
          <button className={`btn${isActive('underline') ? ' active' : ''}`} onClick={() => chainMaybeFocus().toggleUnderline().run()} title="Подчёркнутый">
            <IconUnderline size={18} stroke={1.6} />
          </button>
          <button className={`btn${isActive('strike') ? ' active' : ''}`} onClick={() => chainMaybeFocus().toggleStrike().run()} title="Зачёркнутый">
            <IconStrikethrough size={18} stroke={1.6} />
          </button>
        </div>

        <div className="plate-group">
          <button className={`btn${isActive('highlight') ? ' active' : ''}`} onClick={() => setShowHighlightColors(v => !v)} title="Маркер">
            <Highlighter size={18} weight="regular" />
          </button>
          {showHighlightColors && (
            <div className="popover">
              {HIGHLIGHT_COLORS.map(c => (
                <button
                  key={c}
                  className="color"
                  style={{ background: c }}
                  onClick={() => { chainMaybeFocus().toggleHighlight({ color: c }).run(); setShowHighlightColors(false) }}
                  title={c}
                />
              ))}
              <button
                className="color clear"
                onClick={() => { chainMaybeFocus().unsetHighlight().run(); setShowHighlightColors(false) }}
                title="Очистить маркер"
              >
                ×
              </button>
            </div>
          )}
        </div>

        <div className="plate-group">
          <button className={`btn${isActive('bulletList') ? ' active' : ''}`} onClick={() => chainMaybeFocus().toggleBulletList().run()} title="Маркированный список">
            <IconList size={18} stroke={1.6} />
          </button>
          <button className={`btn${isActive('orderedList') ? ' active' : ''}`} onClick={() => chainMaybeFocus().toggleOrderedList().run()} title="Нумерованный список">
            <IconListNumbers size={18} stroke={1.6} />
          </button>
          <button className="btn" onClick={() => chainMaybeFocus().sinkListItem('listItem').run()} title="Увеличить отступ списка">
            <IconIndentIncrease size={18} stroke={1.6} />
          </button>
          <button className="btn" onClick={() => chainMaybeFocus().liftListItem('listItem').run()} title="Уменьшить отступ списка">
            <IconIndentDecrease size={18} stroke={1.6} />
          </button>
        </div>

        <div className="plate-group">
          <button className="btn" onClick={() => setShowSpecials(v => !v)} title="Спецсимволы">
            <IconCopyright size={18} stroke={1.6} />
          </button>
          {showSpecials && (
            <div className="popover chars">
              {['§','—','–','•','№','«','»','“','”','™','®','©'].map(ch => (
                <button key={ch} className="char" onClick={() => insertSpecialChar(ch)}>{ch}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      <EditorContent editor={editor} />
    </div>
  )
}