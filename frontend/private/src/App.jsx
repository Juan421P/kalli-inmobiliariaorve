import coolAssDesignForTheBackground from '@/assets/cool-ass-design-for-the-background.png'
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom'
import AuthProvider from '@/providers/authProvider'
import Toaster from '@/components/toaster'
import ProtectedRoute from '@/components/protectedRoute'
import Amenities from '@/pages/amenities'
import Appliances from '@/pages/appliances'
import Appointments from '@/pages/appointments'
import Clients from '@/pages/clients'
import Collaborators from '@/pages/collaborators'
import CompleteInvitation from '@/pages/completeInvitation'
import Dashboard from '@/pages/dashboard'
import Features from '@/pages/features'
import ForgotPassword from '@/pages/forgotPassword'
import Login from '@/pages/login'
import Offers from '@/pages/offers'
import Profile from '@/pages/profile'
import Properties from '@/pages/properties'
import Schedules from '@/pages/schedules'
import Tags from '@/pages/tags'
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
			{ path: '/admin/complete-invitation', element: <CompleteInvitation role='admin' /> },
			{ path: '/collaborator/complete-invitation', element: <CompleteInvitation role='collaborator' /> },
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