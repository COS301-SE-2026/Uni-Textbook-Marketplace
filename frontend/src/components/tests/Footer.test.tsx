import { render, screen } from '@testing-library/react'
import Footer from '../Footer'

jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  )
})

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt} />
  },
}))

describe('Footer', () => {

  it('renders brand section with logo and collaboration text', () => {
    render(<Footer />)

    expect(screen.getByText('Uni Textbook')).toBeInTheDocument()
    expect(screen.getByText('Marketplace')).toBeInTheDocument()

    expect(screen.getByText('Developed in collaboration with')).toBeInTheDocument()

    expect(screen.getByAltText('Agile Bridge Logo')).toBeInTheDocument()
  })

  it('renders all footer sections', () => {
    render(<Footer />)
    expect(screen.getByText('Product')).toBeInTheDocument()

    expect(screen.getByText('Support')).toBeInTheDocument()
    
    expect(screen.getByText('University')).toBeInTheDocument()

    expect(screen.getByText('Contact')).toBeInTheDocument()
  })

  it('renders all product links', () => {
    render(<Footer />)
    expect(screen.getByText('Browse Listing')).toBeInTheDocument()
    expect(screen.getByText('Sell a Textbook')).toBeInTheDocument()

    expect(screen.getByText('My Listings')).toBeInTheDocument()
  })

  it('renders all support links', () => {
    render(<Footer />)
    expect(screen.getByText('Help & FAQs')).toBeInTheDocument()

    expect(screen.getByText('Contact Us')).toBeInTheDocument()
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument()


    expect(screen.getByText('Terms of Service')).toBeInTheDocument()
  })

  
})