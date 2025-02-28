'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Handle, Position, useUpdateNodeInternals } from '@xyflow/react'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

import { extractFunctionDetails } from '@/engine/functions'
import Editor from '../Editor'
import useValue from '@/hooks/value'
import { Button } from '../ui/button'
import { X } from 'lucide-react'

const handleStyle = {
  position: 'static',
  transform: 'translate(0, 0)',
  minWidth: '12px',
  minHeight: '12px',
  width: '12px',
  height: '12px',
  borderColor: 'rgb(39 39 42 / var(--tw-border-opacity, 1))',
  backgroundColor: '#fafafa',
}

function FunctionNode({ id, data }) {
  const updateNodeInternals = useUpdateNodeInternals()
  const [returnHandleCount, setReturnHandleCount] = useState(0)
  const [paramsHandleCount, setParamsHandleCount] = useState(0)

  const [error, setError] = useState('no function')
  const [name, setName] = useState('Function')

  const [code, setCode] = useValue('', onCodeChange)

  function onCodeChange(code) {
    let functionName, params, returns

    try {
      const [fn, pr, rr] = extractFunctionDetails(code)
      functionName = fn
      params = pr
      returns = rr
      setError('')
    } catch (error) {}

    if (functionName === undefined || functionName === '') {
      setError('no function')
      setName('Function')
    } else setName(functionName)

    if (params === undefined) {
      setParamsHandleCount(0)
    } else setParamsHandleCount(params.length)

    if (returns === undefined) {
      setReturnHandleCount(0)
    } else setReturnHandleCount(returns.length)

    updateNodeInternals(id)

    if (data.codeListener) {
      data.codeListener(id, functionName, params, returns, code)
    }
  }

  return (
    <Card className='relative min-w-96 flex flex-col dark:bg-[#09090b] dark:text-white dark:border-[#27272a]'>
      <Button
        className='absolute top-0 right-0 m-2 rounded-full p-2 hover:bg-transparent hover:text-white text-white/50 transition-colors h-auto w-auto'
        variant='ghost'
        onClick={() => {
          debugger
          data.deleteNode()
        }}
      >
        <X className='node-close-button' />
      </Button>
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        <CardDescription>Function Node</CardDescription>
      </CardHeader>
      <CardContent className='flex-grow flex flex-col nodrag'>
        <Collapsible defaultOpen={true}>
          <CollapsibleTrigger className='flex items-center gap-2'>
            Code
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth={1.5}
              stroke='currentColor'
              className='size-4'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='m19.5 8.25-7.5 7.5-7.5-7.5'
              />
            </svg>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <Editor
              className='nodrag flex-grow dark:border-[#27272a] cursor-text'
              setCodeHook={setCode}
            ></Editor>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
      <CardFooter>
        <p className='font-thin text-sm text-gray-400'>{error}</p>
      </CardFooter>

      <div className='absolute top-0 right-full -m-[6px] bottom-0 flex flex-col gap-2 justify-center items-center'>
        {Array.from({ length: paramsHandleCount }).map((_, index) => (
          <Handle
            key={index}
            type='target'
            id={`param-handle-${index}`}
            style={handleStyle}
            position={Position.Left}
          />
        ))}
      </div>

      <div className='absolute top-0 left-full -m-[6px] bottom-0 flex flex-col gap-2 justify-center items-center'>
        {Array.from({ length: returnHandleCount }).map((_, index) => (
          <Handle
            key={index}
            type='source'
            id={`return-handle-${index}`}
            style={handleStyle}
            position={Position.Right}
          />
        ))}
      </div>
    </Card>
  )
}

export default FunctionNode
