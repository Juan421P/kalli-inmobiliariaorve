import coolAssDesignForTheBackground from '@/assets/cool-ass-design-for-the-background.png'
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom'
import AuthProvider from '@/providers/AuthProvider'
import Toaster from '@/components/Toaster'
import ProtectedRoute from '@/components/ProtectedRoute'
import BuyProperties from '@/pages/BuyProperties'
import CompareProperties from '@/pages/CompareProperties'
import Home from '@/pages/Home'
import Login from '@/pages/Login'
import Profile from '@/pages/Profile'
import PropertyForSale from '@/pages/PropertyForSale'
import Register from '@/pages/Register'
import RentProperties from '@/pages/RentProperties'
import RentProperty from '@/pages/RentProperty'
import SellProperty from '@/pages/SellProperty'
import ScheduleAppointment from '@/pages/ScheduleAppointment'
import MakeOfferPage from '@/pages/MakeOfferPage'
import Help from '@/pages/Help'

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
			{ path: '/',         element: <Home />            },
			{ path: '/login',    element: <Login />           },
			{ path: '/register', element: <Register />        },
			{ path: '/buy',      element: <BuyProperties />   },
			{ path: '/rent',     element: <RentProperties />  },
			{ path: '/owners/sell', element: <SellProperty /> },
			{ path: '/owners/rent', element: <RentProperty /> },
			{ path: '/property/:public_id', element: <PropertyForSale />  },
			{ path: '/compare',  element: <CompareProperties /> },
			{ path: '/help', element: <Help /> },
			{
				element: <ProtectedRoute />,
				children: [
					{ path: '/profile', element: <Profile /> },
					{ path: '/property/:public_id/offer', element: <MakeOfferPage /> },
					{ path: '/property/:public_id/schedule', element: <ScheduleAppointment /> },
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