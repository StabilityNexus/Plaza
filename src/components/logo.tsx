import Image from 'next/image'
import React from 'react'

const Logo:React.FC = () => {
  return (
   <div className="flex items-center justify-center space-x-2">
             <Image
               width={30}
               height={30}
               src="/logo.svg"
               alt="plaza"
               className=""
             />
             <h1 className="text-2xl font-bold">Plaza</h1>
           </div>
  )
}

export default Logo
