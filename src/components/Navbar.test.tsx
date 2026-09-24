import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Navbar } from './Navbar'

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    onClick,
    ...props
  }: {
    href: string
    children: React.ReactNode
    onClick?: React.MouseEventHandler<HTMLAnchorElement>
  }) => (
    <a
      href={href}
      {...props}
      onClick={(event) => {
        event.preventDefault()
        onClick?.(event)
      }}
    >
      {children}
    </a>
  ),
}))

vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    className,
  }: {
    src: string
    alt: string
    className?: string
  }) => <span aria-label={alt} className={className} data-image-src={src} />,
}))

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}))

describe('Navbar mobile menu focus management', () => {
  it('focuses and contains keyboard traversal, including focus outside the menu', () => {
    render(
      <>
        <button data-testid="outside">Outside</button>
        <Navbar />
      </>,
    )

    const toggle = screen.getByRole('button', { name: 'Toggle navigation' })
    fireEvent.click(toggle)

    const menu = screen
      .getByRole('navigation')
      .querySelector('#mobile-nav-menu')
    expect(menu).toBeInTheDocument()
    const menuLinks = Array.from(menu?.querySelectorAll('a[href]') ?? [])
    const first = menuLinks[0]
    const last = menuLinks.at(-1)
    if (!first || !last) throw new Error('mobile menu links are missing')
    expect(first).toHaveFocus()

    fireEvent.keyDown(first, { key: 'Tab', shiftKey: true })
    expect(last).toHaveFocus()

    fireEvent.keyDown(last, { key: 'Tab' })
    expect(first).toHaveFocus()

    const outside = screen.getByTestId('outside')
    outside.focus()
    fireEvent.keyDown(document, { key: 'Tab' })
    expect(first).toHaveFocus()

    outside.focus()
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })
    expect(last).toHaveFocus()
  })

  it('closes on Escape, returns focus to the toggle, and preserves toggle state', () => {
    render(<Navbar />)

    const toggle = screen.getByRole('button', { name: 'Toggle navigation' })
    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(
      screen.getByRole('navigation').querySelector('#mobile-nav-menu'),
    ).not.toBeInTheDocument()
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(toggle).toHaveFocus()
  })

  it('returns focus to the toggle when navigation or the toggle closes the menu', () => {
    render(<Navbar />)

    const navigation = screen.getByRole('navigation')
    const toggle = screen.getByRole('button', { name: 'Toggle navigation' })

    fireEvent.click(toggle)
    const menu = navigation.querySelector<HTMLElement>('#mobile-nav-menu')
    if (!menu) throw new Error('mobile menu is missing')
    fireEvent.click(within(menu).getByRole('link', { name: 'How It Works' }))
    expect(navigation.querySelector('#mobile-nav-menu')).not.toBeInTheDocument()
    expect(toggle).toHaveAttribute('aria-expanded', 'false')

    fireEvent.click(toggle)
    fireEvent.click(toggle)
    expect(navigation.querySelector('#mobile-nav-menu')).not.toBeInTheDocument()
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(toggle).toHaveFocus()
  })
})
