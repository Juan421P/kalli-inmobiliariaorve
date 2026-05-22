import coolAssDesignForTheBackground from '@/assets/cool-ass-design-for-the-background.png'
import React from 'react'
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
const RootLayout = () => {
	return (
		<div className='relative min-h-screen w-full isolate'>
			<div className='fixed inset-0 z-[-1] bg-cover bg-center opacity-45' style={{ backgroundImage: `url(${coolAssDesignForTheBackground})` }} />
			<Toaster />
			<Outlet />
		</div >
	)
}
const router = createBrowserRouter([
	{
		element: <RootLayout />,
		children: [
			{ path: '/', element: <Login /> },
			{ path: '/dashboard', element: <Dashboard /> },
		]
	}
])
const App = () => {
	return (
		<RouterProvider router={router} />
	)
}
export default App