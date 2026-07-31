import coolAssDesignForTheBackground from '@/assets/cool-ass-design-for-the-background.png'
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom'
import AuthProvider from '@/providers/auth-provider'
import Toaster from '@/components/Toaster'
import ProtectedRoute from '@/components/ProtectedRoute'
import Amenities from '@/pages/Amenities'
import Appliances from '@/pages/Appliances'
import Appointments from '@/pages/Appointments'
import Clients from '@/pages/Clients'
import Collaborators from '@/pages/Collaborators'
import Dashboard from '@/pages/Dashboard'
import Features from '@/pages/Features'
import ForgotPassword from '@/pages/ForgotPassword'
import Login from '@/pages/Login'
import Offers from '@/pages/Offers'
import Profile from '@/pages/Profile'
import Properties from '@/pages/Properties'
import Schedules from '@/pages/Schedules'
import Tags from '@/pages/Tags'
const RootLayout = () => (
	<div className='relative min-h-screen w-full isolate'>
		<div className='fixed inset-0 z-[-1] bg-cover bg-center opacity-45' style={{ backgroundImage: `url(${coolAssDesignForTheBackground})` }} />
		<Toaster />
		<Outlet />
	</div>
)
const router = createBrowserRouter([
	{
		element: <RootLayout />,
		children: [
			{ path: '/', element: <Login /> },
			{ path: '/forgot-password', element: <ForgotPassword /> },
			{
				element: <ProtectedRoute />,
				children: [
					{ path: '/dashboard', element: <Dashboard /> },
					{ path: '/properties', element: <Properties /> },
					{ path: '/appointments', element: <Appointments /> },
					{ path: '/offers', element: <Offers /> },
					{ path: '/profile', element: <Profile /> },
												{ path: '/collaborators', element: <Collaborators /> },
							{ path: '/schedules', element: <Schedules /> },
							{ path: '/catalogs/amenities', element: <Amenities /> },
							{ path: '/catalogs/tags', element: <Tags /> },
							{ path: '/catalogs/features', element: <Features /> },
							{ path: '/catalogs/appliances', element: <Appliances /> },
					{
						element: <ProtectedRoute requiredRole='admin' />,
						children: [
							{ path: '/clients', element: <Clients /> },
						],
					},
				],
			},
		],
	},
])
const App = () => (
	<AuthProvider>
		<RouterProvider router={router} />
	</AuthProvider>
)
export default App