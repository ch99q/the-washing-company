export default function Layout({children}) {
  return (
    <div>
      <header>
        <span>The Washing Company</span>
      </header>

      <main>
        {children}
      </main>

      <footer>
        <span>&copy; {new Date().getFullYear()} The Washing Company</span>
      </footer>
    </div>
  )
}
