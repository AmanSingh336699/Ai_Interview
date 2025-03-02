import Link from 'next/link'
import React from 'react'
import { FaUserCircle } from "react-icons/fa"

function Header() {
  return (
    <header className='p-4 bg-gray-800 flex justify-between items-center'>
        <h1 className='text-xl font-bold'>AI Interview</h1>
        <Link href={`/dashboard`}>
            <FaUserCircle className='text-3xl text-white cursor-pointer' />
        </Link>
    </header>
  )
}

export default React.memo(Header)