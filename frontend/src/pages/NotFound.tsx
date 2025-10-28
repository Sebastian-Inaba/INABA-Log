// src/pages/NotFound.tsx
export function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-8 font-sans pt-[70px]">
            {/* Animated number */}
            <div className="text-6xl md:text-8xl font-bold text-purple-600 mb-4 animate-bounce">
                404
            </div>

            {/* Main message */}
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-300 mb-4">
                Oops! You seem to be lost.
            </h1>

            {/* Descriptive text */}
            <p className="text-lg text-gray-200 mb-8 max-w-md leading-relaxed">
                The page you're looking for seems to have vanished into the
                void. It might have been moved, deleted, or never existed in the
                first place.
            </p>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                    onClick={() => window.history.back()}
                    className="px-6 py-3 bg-purple-600 text-white border-none rounded-lg text-base cursor-pointer transition-colors hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                >
                    Go Back
                </button>

                <button
                    onClick={() => (window.location.href = '/')}
                    className="px-6 py-3 bg-transparent text-purple-600 border-2 border-purple-600 rounded-lg text-base cursor-pointer transition-all hover:bg-purple-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                >
                    Go Home
                </button>
            </div>
        </div>
    );
}
