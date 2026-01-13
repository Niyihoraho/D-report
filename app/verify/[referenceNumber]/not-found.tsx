import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Report Not Found',
    description: 'The requested report could not be found',
}

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
            <div className="text-center">
                <h1 className="text-6xl font-bold text-gray-300 dark:text-gray-700 mb-4">404</h1>
                <h2 className="text-2xl font-bold mb-4">Report Not Found</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
                    The report you're trying to verify doesn't exist or the reference number is invalid.
                </p>
                <a
                    href="/"
                    className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Go Home
                </a>
            </div>
        </div>
    )
}
