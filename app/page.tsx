const gradient = "bg-linear-to-tr from-amber-400 via-pink-500 to-purple-600";

const posts = [
  "from-pink-400 to-orange-300",
  "from-sky-400 to-indigo-500",
  "from-emerald-300 to-teal-500",
  "from-fuchsia-500 to-purple-600",
  "from-amber-300 to-rose-400",
  "from-cyan-300 to-blue-500",
];

const stories = ["you", "mia", "leo", "ava", "sam"];

const features = [
  {
    icon: "📸",
    title: "Share moments",
    text: "Post photos and short videos in seconds, with filters that make every shot pop.",
  },
  {
    icon: "💬",
    title: "Stay connected",
    text: "Direct messages, comments and reactions keep you close to the people you care about.",
  },
  {
    icon: "✨",
    title: "Discover more",
    text: "Explore creators, trends and communities picked for what you actually love.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-white text-zinc-900 dark:bg-black dark:text-zinc-100">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <span className={`${gradient} bg-clip-text text-2xl font-bold text-transparent`}>
          Momento
        </span>
        <nav className="flex items-center gap-3 text-sm font-medium">
          <a href="#" className="px-3 py-2 hover:opacity-70">
            Log in
          </a>
          <a href="#" className={`${gradient} rounded-full px-4 py-2 text-white`}>
            Sign up
          </a>
        </nav>
      </header>

      <main className="flex-1">
        <section className="mx-auto grid max-w-6xl items-center gap-16 px-6 py-16 md:grid-cols-2 md:py-24">
          <div>
            <h1 className="text-5xl font-bold tracking-tight md:text-6xl">
              Share your world,{" "}
              <span className={`${gradient} bg-clip-text text-transparent`}>one moment</span> at a
              time.
            </h1>
            <p className="mt-6 max-w-md text-lg text-zinc-600 dark:text-zinc-400">
              Momento is where friends, creators and communities come together to share what
              matters — beautifully.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="#"
                className={`${gradient} rounded-full px-6 py-3 font-semibold text-white shadow-lg shadow-pink-500/30 transition hover:scale-105`}
              >
                Get started — it&apos;s free
              </a>
              <a
                href="#features"
                className="rounded-full border border-zinc-300 px-6 py-3 font-semibold transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
              >
                Learn more
              </a>
            </div>
            <p className="mt-6 text-sm text-zinc-500">Joined by 2M+ people sharing every day.</p>
          </div>

          {/* Phone mockup */}
          <div className="relative mx-auto">
            <div className={`${gradient} absolute -inset-10 rounded-full opacity-30 blur-3xl`} />
            <div className="relative w-72 rounded-[2.5rem] border-8 border-zinc-900 bg-white p-3 shadow-2xl dark:border-zinc-700 dark:bg-zinc-950">
              <div className="mb-3 flex items-center justify-between px-1 text-sm font-semibold">
                <span>Momento</span>
                <span>♡ ✉</span>
              </div>
              <div className="mb-3 flex gap-2">
                {stories.map((name) => (
                  <div key={name} className="flex flex-col items-center gap-1">
                    <div className={`${gradient} rounded-full p-0.5`}>
                      <div className="size-10 rounded-full border-2 border-white bg-zinc-200 dark:border-zinc-950 dark:bg-zinc-800" />
                    </div>
                    <span className="text-[10px] text-zinc-500">{name}</span>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-1">
                {posts.map((colors) => (
                  <div key={colors} className={`aspect-square rounded-sm bg-linear-to-br ${colors}`} />
                ))}
              </div>
              <div className="mt-3 flex justify-around border-t border-zinc-200 pt-3 text-lg dark:border-zinc-800">
                <span>⌂</span>
                <span>⌕</span>
                <span>⊕</span>
                <span>♡</span>
                <span>◯</span>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="bg-zinc-50 py-24 dark:bg-zinc-950">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-center text-3xl font-bold md:text-4xl">Everything you need to share</h2>
            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-black"
                >
                  <div className="text-3xl">{f.icon}</div>
                  <h3 className="mt-4 text-xl font-semibold">{f.title}</h3>
                  <p className="mt-2 text-zinc-600 dark:text-zinc-400">{f.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-24">
          <div className={`${gradient} rounded-3xl px-8 py-16 text-center text-white`}>
            <h2 className="text-3xl font-bold md:text-4xl">Ready to share your first moment?</h2>
            <p className="mx-auto mt-4 max-w-md text-white/90">
              Create your account in under a minute. No ads in your face, just your people.
            </p>
            <a
              href="#"
              className="mt-8 inline-block rounded-full bg-white px-6 py-3 font-semibold text-pink-600 transition hover:scale-105"
            >
              Create account
            </a>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-200 py-8 text-center text-sm text-zinc-500 dark:border-zinc-800">
        © 2026 Momento. All rights reserved.
      </footer>
    </div>
  );
}
