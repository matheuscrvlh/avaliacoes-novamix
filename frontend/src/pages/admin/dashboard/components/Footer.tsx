export function Footer() {
  return (
    <footer className="mt-10 border-t border-zinc-200 pt-4 flex flex-col items-center justify-center text-sm text-zinc-500">
      <div className="flex items-center justify-center gap-4">
        <p>Desenvolvido por:</p>
        <a
          href="https://github.com/marlonalvees"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 hover:text-orange-500 transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-4 h-4"
          >
            <path d="M12 0C5.37 0 0 5.37 0 12a12 12 0 008.2 11.4c.6.1.82-.26.82-.58v-2.02c-3.34.72-4.04-1.61-4.04-1.61-.55-1.38-1.34-1.74-1.34-1.74-1.1-.75.08-.74.08-.74 1.22.08 1.86 1.25 1.86 1.25 1.08 1.86 2.84 1.32 3.53 1.01.11-.79.42-1.32.76-1.62-2.66-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 016 0c2.28-1.55 3.3-1.23 3.3-1.23.66 1.66.25 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.62-5.49 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.21.7.83.58A12 12 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
          Marlon Alves
        </a>

        <a
          href="https://github.com/matheuscrvlh"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 hover:text-orange-500 transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-4 h-4"
          >
            <path d="M12 0C5.37 0 0 5.37 0 12a12 12 0 008.2 11.4c.6.1.82-.26.82-.58v-2.02c-3.34.72-4.04-1.61-4.04-1.61-.55-1.38-1.34-1.74-1.34-1.74-1.1-.75.08-.74.08-.74 1.22.08 1.86 1.25 1.86 1.25 1.08 1.86 2.84 1.32 3.53 1.01.11-.79.42-1.32.76-1.62-2.66-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 016 0c2.28-1.55 3.3-1.23 3.3-1.23.66 1.66.25 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.62-5.49 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.21.7.83.58A12 12 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
          Matheus Carvalho
        </a>
      </div>
    </footer>
  );
}
