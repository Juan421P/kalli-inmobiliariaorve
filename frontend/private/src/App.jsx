import { Button } from '@/components/ui/button';
import LocationPicker from '@/components/location-picker';
import { useState } from 'react'
import './App.css'
function App() {
	const [count, setCount] = useState(0)
	return (
		<div className="min-h-screen bg-background p-8">
			<div className="max-w-4xl mx-auto">
				<h1 className="text-3xl font-bold text-center mb-8">
				</h1>
				<LocationPicker />
			</div>

		</div>
	);
}
export default App