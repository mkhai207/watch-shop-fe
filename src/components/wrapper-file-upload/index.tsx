import React from 'react'
import { useDropzone, Accept } from 'react-dropzone'

interface TProps {
  children: React.ReactNode
  uploadFunc: (file: File) => void
  objectAcceptFile?: Accept
}

const WrapperFileUpload = (props: TProps) => {
  const { children, uploadFunc, objectAcceptFile } = props

  const { getRootProps, getInputProps } = useDropzone({
    accept: objectAcceptFile || {},
    onDrop: acceptedFiles => {
      uploadFunc(acceptedFiles[0])
    }
  })

  return (
    <div {...getRootProps({ className: 'dropzone' })}>
      <input {...getInputProps()} />
      {children}
    </div>
  )
}

export default WrapperFileUpload
