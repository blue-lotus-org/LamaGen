import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border mt-8 py-6">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm text-muted-foreground">
          Built by{" "}
          <Link
            href="https://lotuschain.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            BlueLotus
          </Link>
        </p>
      </div>
    </footer>
  )
}

