import coolAssDesignForTheBackground from '@/assets/cool-ass-design-for-the-background.png'
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom'
import AuthProvider from '@/providers/authProvider'
import Toaster from '@/components/Toaster'
import ProtectedRoute from '@/components/ProtectedRoute'
import Admins from '@/pages/admins'
import Amenities from '@/pages/Amenities'
import Appliances from '@/pages/Appliances'
import Appointments from '@/pages/Appointments'
import Clients from '@/pages/Clients'
import Collaborators from '@/pages/Collaborators'
import CompleteInvitation from '@/pages/completeInvitation'
import Dashboard from '@/pages/Dashboard'
import Features from '@/pages/Features'
import ForgotPassword from '@/pages/ForgotPassword'
import Login from '@/pages/Login'
import NotFound from '@/pages/NotFound'
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

// createBrowserRouter arma el árbol de rutas una sola vez al cargar el módulo, así
// que si agregás una ruta y no aparece en el navegador, no está mal escrita: hace
// falta un reload completo del dev server, HMR no lo recoge
const router = createBrowserRouter([
	{
		element: <RootLayout />,
		errorElement: <NotFound />,
		children: [
			{ path: '/', element: <Login /> },
			{ path: '/forgot-password', element: <ForgotPassword /> },
			{ path: '/admin/complete-invitation', element: <CompleteInvitation role='admin' /> },
			{ path: '/collaborator/complete-invitation', element: <CompleteInvitation role='collaborator' /> },
			{
				// Todo lo de aquí para abajo requiere sesión iniciada, sin importar el rol
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
						// Estas dos van un nivel más adentro porque además de sesión
						// iniciada exigen rol admin — un colaborador que entre a mano
						// por la URL rebota a /dashboard
						element: <ProtectedRoute requiredRole='admin' />,
						children: [
							{ path: '/clients', element: <Clients /> },
							{ path: '/admins', element: <Admins /> },
						],
					},
				],
			},
			// Cualquier ruta no declarada arriba cae aquí
			{ path: '*', element: <NotFound /> },
		],
	},
])

const App = () => (
	<AuthProvider>
		<RouterProvider router={router} />
	</AuthProvider>
)

export default App