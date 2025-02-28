'use client'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  Panel,
} from '@xyflow/react'

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'

import { Copy, ArrowDown10 } from 'lucide-react'

import '@xyflow/react/dist/style.css'
import FunctionNode from '@/components/nodes/FunctionNode'
import { ThemeProvider } from '@/components/theme-provider'
import { Button } from '@/components/ui/button'
import Editor from '@/components/Editor'
import { Toaster } from '@/components/ui/sonner'
import { topologicalSort } from '@/engine/sort'

const initialEdges = [
  //  { id: 'e1-2', source: '1', target: '2' }
]

export default function App() {
  const [openCode, setOpenCode] = useState(false)
  const [code, setCode] = useState('')

  const nodesCode = useRef({})

  const deleteNode = useCallback(id => {
    setNodes(nds => nds.filter(node => node.id !== id))
  }, [])

  const initialNodes = useMemo(
    () => [
      {
        id: '1',
        position: { x: 300, y: 200 },
        type: 'function',
        data: {
          codeListener: (id, functionName, params, returns, code) =>
            (nodesCode.current[id] = { functionName, params, returns, code }),
          deleteNode: () => deleteNode('1'),
        },
      },
    ],
    []
  )
  const [open, setOpen] = useState(false)

  const [nodes, setNodes] = useNodesState(initialNodes)
  const [edges, setEdges] = useEdgesState(initialEdges)

  const nodeTypes = useMemo(() => ({ function: FunctionNode }))

  const onConnect = useCallback(
    params => setEdges(eds => addEdge(params, eds)),
    [setEdges]
  )

  const onNodesChange = useCallback(
    changes => setNodes(nds => applyNodeChanges(changes, nds)),
    []
  )
  const onEdgesChange = useCallback(
    changes => setEdges(eds => applyEdgeChanges(changes, eds)),
    []
  )

  const addNode = () => {
    const id = (nodes.length + 1).toString()
    const newNode = {
      id: id,
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      type: 'function',
      data: {
        codeListener: (id, functionName, params, returns, code) =>
          (nodesCode.current[id] = { functionName, params, returns, code }),
        deleteNode: () => deleteNode(id),
      },
    }
    setNodes([...nodes, newNode])
  }

  const run = useCallback(() => {
    try {
      let fullCode = ''
      let params = {}

      Object.keys(nodesCode.current).forEach(id => {
        const code = nodesCode.current[id].code
        fullCode += code + '\n' + '\n'
        if (nodesCode.current[id].params.length == 0) params[id] = []
      })

      edges.forEach(edge => {
        const targetId = parseInt(edge.target)
        const sourceId = parseInt(edge.source)

        const source = nodesCode.current[sourceId]
        const target = nodesCode.current[targetId]

        const sourceReturnHandle = parseInt(
          edge.sourceHandle.replace('return-handle-', '')
        )

        const paramExpectedName = `${source.functionName}_${sourceReturnHandle}`
        if (params[targetId])
          params[targetId] = [...params[targetId], paramExpectedName]
        else params[targetId] = [paramExpectedName]
      })

      const sorted = topologicalSort(nodes, edges)

      sorted.forEach(id => {
        const node = nodesCode.current[id]

        let line = '\n'
        if (node.returns.length >= 1) {
          line += 'const '
          if (node.returns.length > 1) {
            line += `[`
            node.returns.forEach((_, index) => {
              line += `${node.functionName}_${index}, `
            })
            line += `] = `
          } else line += `${node.functionName}_0 ` + ' = '
        }
        line += node.functionName + '('

        if (params[id] === undefined) {
          throw new Error(
            `The function "${node.functionName}" has unfilled parameters`
          )
        }

        if (params[id].length > 0) {
          line += `${params[id][0]}`

          for (let i = 1; i < params[id].length; i++) {
            line += `, ${params[id][i]}`
          }
        }

        line += ')'
        fullCode += line
      })

      console.log('fullCode:\n', fullCode)
      setCode(fullCode)
      setOpenCode(true)
    } catch (error) {
      toast(error.message)
    }
  }, [edges])

  const copyCode = () => {
    navigator.clipboard.writeText(code)
    setOpenCode(false)
    toast('Code copied to clipboard')
  }

  return (
    <ThemeProvider
      attribute='class'
      defaultTheme='system'
      enableSystem
      disableTransitionOnChange
    >
      <ContextMenu open={open} onOpenChange={setOpen}>
        <ContextMenuTrigger>
          <div
            style={{ width: '100vw', height: '100vh' }}
            className='dark:bg-black'
          >
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
            >
              <Panel position='top-right'>
                <Button onClick={run}>
                  <ArrowDown10 /> Compile
                </Button>
              </Panel>
              <Controls
                style={{ backgroundColor: 'black' }}
                className='controls text-white/80 rounded-md'
              />
              <Background variant='dots' gap={12} size={1} bgColor='#18181b' />
            </ReactFlow>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <Command>
            <CommandInput placeholder='Type a node or search...' />
            <CommandList>
              <CommandEmpty>No nodes found.</CommandEmpty>
              <CommandGroup heading='Nodes'>
                <CommandItem
                  onSelect={() => {
                    setOpen(false)
                    console.log('open')
                    addNode()
                  }}
                  className='flex justify-center items-center cursor-pointer'
                >
                  function
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </ContextMenuContent>
      </ContextMenu>
      <Dialog open={openCode} onOpenChange={setOpenCode}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Code</DialogTitle>
            <DialogDescription>Compiled code</DialogDescription>
          </DialogHeader>
          <Editor code={code} readOnly={true} />
          <DialogFooter className='sm:justify-start'>
            <Button type='submit' size='sm' className='px-3' onClick={copyCode}>
              <span className='sr-only'>Copy</span>
              <Copy />
            </Button>
            <DialogClose asChild>
              <Button type='button' variant='secondary'>
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Toaster />
    </ThemeProvider>
  )
}
