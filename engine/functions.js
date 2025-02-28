export function extractFunctionDetails(funcString) {
  let returns = []

  // Extract the function name (if present)
  const nameMatch = funcString.match(/function\s+(\w+)\s*\(/)
  const functionName = nameMatch ? nameMatch[1] : null

  // Extract the parameters
  const paramsMatch = funcString.match(/\(([^)]+)\)/)
  const params = paramsMatch
    ? paramsMatch[1].split(',').map(param => param.trim())
    : []

  // Extract the return statement
  const returnMatch = funcString.match(/return\s+(?:\[([^\]]+)\]|(.+))/)

  if (returnMatch) {
    const singleReturn = returnMatch[2]
    const multiReturn = returnMatch[1]

    if (multiReturn) {
      returns = multiReturn.split(',').map(param => param.trim())
    } else if (singleReturn) {
      returns = [singleReturn]
    }
  }

  return [functionName, params, returns]
}
