/* eslint-disable react/display-name */
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
/* eslint-enable react/display-name */

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

  it('renders all university links', () => {
    render(<Footer />)
    expect(screen.getByText('Brand Style Guide')).toBeInTheDocument()
    expect(screen.getByText('About Us')).toBeInTheDocument()
    expect(screen.getByText('Our Collaborators')).toBeInTheDocument()
  })

  it('renders social media icons', () => {
    render(<Footer />)

    expect(screen.getByLabelText('Facebook')).toBeInTheDocument()
    expect(screen.getByLabelText('Instagram')).toBeInTheDocument()

    expect(screen.getByLabelText('GitHub')).toBeInTheDocument()
  })

  it('renders contact information', () => {

    render(<Footer />)
    expect(screen.getByText('nexusdev.cos301@gmail.com')).toBeInTheDocument()

    expect(screen.getByText('University of Pretoria')).toBeInTheDocument()
  })

  it('renders copyright notice with current year', () => {
    render(<Footer />)
    const currentYear = new Date().getFullYear()


    expect(screen.getByText(`© ${currentYear} Uni-Textbook Marketplace. All rights reserved.`)).toBeInTheDocument()
  })

  it('GitHub link points to correct repository', () => {


    render(<Footer />)
    const githubLink = screen.getByLabelText('GitHub').closest('a')

    expect(githubLink).toHaveAttribute('href', 'https://github.com/COS301-SE-2026/Uni-Textbook-Marketplace')
    expect(githubLink).toHaveAttribute('target', '_blank')

    
    expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer')
  })
})