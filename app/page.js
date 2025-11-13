import HomeActions from "@/components/HomeActions";

export default function Home() {
  return (
    <div className="text-white relative flex-grow flex flex-col bg-slate-950">
      <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-gradient-to-br from-indigo-900/50 to-slate-950/0 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-gradient-to-tl from-purple-900/50 to-slate-950/0 rounded-full filter blur-3xl animate-pulse animation-delay-4000"></div>
      </div>
      
      <div className="relative z-10 flex-grow flex items-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                
                <div className="text-center md:text-left">
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-slate-200 to-slate-400">
                        Welcome to EduMart
                    </h1>
                    <p className="mt-6 text-lg md:text-xl text-slate-300 max-w-xl mx-auto md:mx-0">
                        The easiest way for students to buy and sell campus essentials. From textbooks to lab coats, find what you need or give your old items a new life.
                    </p>
                    
                    <HomeActions />

                </div>

                <div className="hidden md:flex justify-center">
                    <div className="w-96 h-96 p-4 bg-slate-800/40 rounded-full">
                         <lord-icon
                            class="w-full h-full"
                            src="https://cdn.lordicon.com/jdgfsfzr.json"
                            trigger="loop"
                            delay="2000"
                            stroke="bold"
                            colors="primary:#ffffff,secondary:#a482ff"
                         ></lord-icon>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

