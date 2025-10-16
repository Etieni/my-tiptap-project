import { useCallback } from 'react'

/**
 * Хук с командами редактора
 * Возвращает все основные команды для работы с TipTap editor
 */
export const useEditorCommands = (editor) => {
  // Фокус только если редактор уже в фокусе
  const chainMaybeFocus = useCallback(() => {
    return editor?.isFocused ? editor.chain().focus() : editor?.chain()
  }, [editor])

  // Установка размера шрифта
  const setFontSize = useCallback((size) => {
    if (!editor) return
    chainMaybeFocus().setFontSize(size).run()
  }, [editor, chainMaybeFocus])

  // Установка шрифта
  const setFont = useCallback((family) => {
    if (!editor) return
    if (family) {
      chainMaybeFocus().setFontFamily(family).run()
    } else {
      chainMaybeFocus().unsetFontFamily().run()
    }
  }, [editor, chainMaybeFocus])

  // Установка межстрочного интервала
  const setLineHeight = useCallback((value) => {
    if (!editor) return
    chainMaybeFocus().setLineHeight(value).run()
  }, [editor, chainMaybeFocus])

  // Получение текущего межстрочного интервала
  const getCurrentLineHeight = useCallback(() => {
    if (!editor) return '1.5'
    const p = editor.getAttributes('paragraph')?.lineHeight
    const h = editor.getAttributes('heading')?.lineHeight
    return p || h || '1.5'
  }, [editor])

  // Вставка спецсимвола
  const insertSpecialChar = useCallback((char) => {
    if (!editor) return
    chainMaybeFocus().insertContent(char).run()
  }, [editor, chainMaybeFocus])

  // Применение заголовка
  const applyHeading = useCallback((value) => {
    if (!editor) return
    if (value === 'p') {
      chainMaybeFocus().setParagraph().run()
    } else if (value === 'h1') {
      chainMaybeFocus().toggleHeading({ level: 1 }).run()
    } else if (value === 'h2') {
      chainMaybeFocus().toggleHeading({ level: 2 }).run()
    } else if (value === 'h3') {
      chainMaybeFocus().toggleHeading({ level: 3 }).run()
    }
  }, [editor, chainMaybeFocus])

  return {
    chainMaybeFocus,
    setFontSize,
    setFont,
    setLineHeight,
    getCurrentLineHeight,
    insertSpecialChar,
    applyHeading,
  }
}