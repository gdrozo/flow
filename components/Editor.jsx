'use client'

import { use, useEffect, useRef } from 'react'
import { EditorView, basicSetup } from 'codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { EditorState } from '@codemirror/state'

const Editor = ({ className, code, setCodeHook, readOnly = false }) => {
  const element = useRef(null)
  const editorView = useRef(null)

  useEffect(() => {
    console.log('code?', code)
    setCode(code)
  }, [code])

  useEffect(() => {
    if (!element.current || editorView.current) return

    let myTheme = EditorView.theme(
      {
        '&': {
          color: 'white',
          backgroundColor: '#1f1f1f',
        },
        '.cm-content': {
          caretColor: '#aeafad',
        },
        '&.cm-focused .cm-cursor': {
          borderLeftColor: '#aeafad',
        },
        '&.cm-focused .cm-selectionBackground, ::selection': {
          backgroundColor: 'green',
        },
        '.cm-gutters': {
          backgroundColor: '#1f1f1f',
          color: '#424242',
          borderRight: '#404040 1px solid',
        },
        '.cm-activeLineGutter': {
          color: '#cccccc',
          backgroundColor: '#1f1f1f',
        },
        '.cm-activeLine': {
          backgroundColor: 'transparent',
          outline: '#282828 1px solid',
        },
        '.cm-editor': {
          overflow: 'hidden',
          borderRadius: 'calc(var(--radius) - 2px)',
        },
      },
      { dark: true }
    )

    editorView.current = new EditorView({
      extensions: [
        basicSetup,
        javascript(),
        myTheme,
        EditorView.updateListener.of(update => {
          if (update.changes && setCodeHook) {
            setCodeHook(update.state.doc.toString())
          }
        }),
        EditorState.readOnly.of(readOnly),
        EditorView.editable.of(!readOnly),
      ],
      parent: element.current,
    })

    if (code === '' || code === undefined)
      setCode(Array.from({ length: 1 }).join('\n'))
  }, [element])

  const setCode = code => {
    if (code === undefined) return

    console.log('setCode', code, editorView.current)
    if (editorView.current) {
      editorView.current.dispatch({
        changes: {
          from: 0,
          to: editorView.current.state.doc.length,
          insert: code,
        },
      })
    } else setTimeout(() => setCode(code), 100)
  }

  const getCode = () => {
    return editorView.current ? editorView.current.state.doc.toString() : ''
  }

  return (
    <div className={className}>
      <div className='rounded-md overflow-hiddens' ref={element}></div>
    </div>
  )
}

export default Editor
