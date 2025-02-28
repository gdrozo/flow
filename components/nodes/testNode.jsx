import { useCallback, useState } from 'react'
import { Handle, Position, useUpdateNodeInternals } from '@xyflow/react'

const handleStyle = { position: 'static', transform: 'translate(0, 0)' }

function TestNode({ id }) {
  const updateNodeInternals = useUpdateNodeInternals()
  const [handleCount, setHandleCount] = useState(1)

  const onChange = useCallback(
    e => {
      console.log(e.target.value)
      setHandleCount(e.target.value)
      updateNodeInternals(id)
    },
    [id, updateNodeInternals]
  )

  return (
    <div className='border border-gray-300 p-4 rounded-md'>
      <Handle type='target' position={Position.Left} />
      <div>
        <label className='pr-4' htmlFor='text'>
          Outputs:
        </label>
        <input
          id='text'
          name='text'
          type='number'
          onChange={onChange}
          className='nodrag'
          min={0}
          max={100}
          defaultValue={1}
        />
      </div>
      <div className='absolute top-0 left-full -m-[3px] bottom-0 flex flex-col gap-2 justify-center items-center'>
        {Array.from({ length: handleCount }).map((_, index) => (
          <Handle
            key={index}
            type='target'
            id={`handle-${index}`}
            style={handleStyle}
            position={Position.Right}
          />
        ))}
      </div>
    </div>
  )
}

export default TestNode
