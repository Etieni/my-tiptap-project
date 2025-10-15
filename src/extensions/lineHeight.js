import { Extension } from '@tiptap/core'

const LineHeight = Extension.create({
  name: 'lineHeight',

  addGlobalAttributes() {
    return [
      {
        // применяем line-height к блочным узлам
        types: ['paragraph', 'heading'],
        attributes: {
          lineHeight: {
            default: null,
            parseHTML: element => element.style.lineHeight || null,
            renderHTML: attrs => {
              if (!attrs.lineHeight) return {}
              return { style: `line-height: ${attrs.lineHeight}` }
            },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      setLineHeight:
        value =>
        ({ chain }) =>
          chain()
            .updateAttributes('paragraph', { lineHeight: value })
            .updateAttributes('heading', { lineHeight: value })
            .run(),
      unsetLineHeight:
        () =>
        ({ chain }) =>
          chain()
            .updateAttributes('paragraph', { lineHeight: null })
            .updateAttributes('heading', { lineHeight: null })
            .run(),
    }
  },
})

export default LineHeight