import coolAssDesignForTheBackground from '@/assets/cool-ass-design-for-the-background.png';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import AuthProvider from '@/providers/AuthProvider';
import Toaster from '@/components/Toaster';
import ProtectedRoute from '@/components/ProtectedRoute';
import Home from '@/pages/Home';
import BuyProperties from './pages/BuyProperties';
import CompareProperties from './pages/CompareProperties';
import Login from './pages/Login';
import Profile from './pages/Profile';
import PropertyForSale from './pages/PropertyForSale';
import Register from './pages/Register';
import RentProperties from './pages/RentProperties';
const RootLayout = () => (
	<div className='relative min-h-screen w-full isolate'>
		<div className='fixed inset-0 z-[-1] bg-cover bg-center opacity-45' style={{ backgroundImage: `url(${coolAssDesignForTheBackground})` }} />
		<Toaster />
		<Outlet />
	</div>
);
const router = createBrowserRouter([
	{
		element: <RootLayout />,
		children: [
			{ path: '/', element: <Home /> },
			{
				element: <ProtectedRoute />,
				children: [
					{ path: '/buy', element: <BuyProperties /> },
					{ path: '/compare', element: <CompareProperties /> },
					{ path: '/login', element: <Login /> },
					{ path: '/profile', element: <Profile /> },
					{ path: '/sell', element: <PropertyForSale /> },
					{ path: '/register', element: <Register /> },
					{ path: '/rent', element: <RentProperties /> },
					/**
					 * {
							element: <ProtectedRoute requiredRole='admin' />,
							children: [
								{ path: '/clients', element: <Clients /> },
								{ path: '/collaborators', element: <Collaborators /> },
								{ path: '/schedules', element: <Schedules /> },
								{ path: '/catalogs/amenities', element: <Amenities /> },
								{ path: '/catalogs/tags', element: <Tags /> },
								{ path: '/catalogs/features', element: <Features /> },
								{ path: '/catalogs/appliances', element: <Appliances /> },
							],
						},
					 */
				],
			},
		],
	},
]);
const App = () => (
	<AuthProvider>
		<RouterProvider router={router} />
	</AuthProvider>
);
export default App;