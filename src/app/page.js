export default function Home() {
    return (
        <main className="font-sans max-w-3xl mx-auto p-6">
            <h1 className="mb-4 font-semibold text-xl">Knowledge Notes</h1>

            <form className="space-y-4">
                <div className="relative group">
                    {/* input judul */}
                    <input
                        id="title"
                        name="title"
                        placeholder=" "
                        className={[
                            'peer w-full rounded-md border border-gray-300 bg-white p-3',
                            'outline-none',
                            'transition-all duration-300',
                            'focus:border-blue-400 focus:ring-4 focus:ring-blue-100 focus:shadow-md',
                        ].join(' ')}
                    />
                    <label
                        htmlFor="title"
                        className={[
                            'pointer-events-none absolute left-3 top-3 text-gray-300',
                            'transition-all duration-300',
                            // ketika fokus atau ada nilai → label naik & mengecil
                            'peer-focus:-top-2 peer-focus:text-xs peer-focus:text-blue-600',
                            'peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm',
                            'peer-[&:not(:placeholder-shown)]:-top-2 peer-[&:not(:placeholder-shown)]:text-xs',
                            // latar kecil agar label terbaca saat naik
                            'px-1 bg-white',
                        ].join(' ')}
                    >
                        Title
                    </label>
                </div>
                <div className="relative group">
                    {/* input text area (content) */}
                    <textarea
                        id="content"
                        name="content"
                        placeholder=" "
                        className={[
                            'peer w-full rounded-md border border-gray-300 bg-white p-3',
                            'outline-none',
                            'transition-all duration-300',
                            'min-h- resize-y',
                            'focus:border-blue-400 focus:ring-4 focus:ring-blue-100 focus:shadow-md',
                        ].join(' ')}
                    />

                    <label
                        htmlFor="content"
                        className={[
                            'pointer-events-none absolute left-3 top-3 text-gray-300',
                            'transition-all duration-300',
                            'peer-focus:-top-2 peer-focus:text-xs peer-focus:text-blue-600',
                            'peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm',
                            'peer-[&:not(:placeholder-shown)]:-top-2 peer-[&:not(:placeholder-shown)]:text-xs',
                            'px-1 bg-white',
                        ].join(' ')}
                    >
                        Content
                    </label>
                </div>
            </form>
        </main>
    );
}
