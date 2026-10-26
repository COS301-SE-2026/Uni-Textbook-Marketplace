import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CornerCropEditor from '../CornerCropEditor'

jest.mock('@/utils/removeUniformBackground', () => ({
  removeUniformBackground: jest.fn(),
}))

import { removeUniformBackground } from '@/utils/removeUniformBackground'
const mockRemoveBg = removeUniformBackground as jest.Mock

const DETECTED = [
  { x: 0.2, y: 0.2 },
  { x: 0.8, y: 0.2 },
  { x: 0.8, y: 0.8 },
  { x: 0.2, y: 0.8 },
]

beforeEach(() => {
  jest.clearAllMocks()
  mockRemoveBg.mockReturnValue({
    dataUrl: 'data:image/jpeg;base64,PROCESSED',
    corners: DETECTED,
  })

  jest.spyOn(window, 'Image' as never).mockImplementation(() => {
    const img: any = {
      naturalWidth: 200,
      naturalHeight: 200,
      crossOrigin: '',
      onload: null,
      onerror: null,
    }
    let srcValue = ''
    Object.defineProperty(img, 'src', {
      get: () => srcValue,
      set: (v: string) => {
        srcValue = v
        Promise.resolve().then(() => img.onload?.())
      },
      configurable: true,
    })
    return img
  })

  ;(HTMLCanvasElement.prototype as any).getContext = jest.fn(() => ({
    fillRect: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    closePath: jest.fn(),
    clip: jest.fn(),
    drawImage: jest.fn(),
    fillStyle: '',
  }))
  ;(HTMLCanvasElement.prototype as any).toDataURL = jest.fn(
    () => 'data:image/jpeg;base64,CROPPED',
  )
  ;(HTMLElement.prototype as any).setPointerCapture = jest.fn()
  ;(HTMLElement.prototype as any).releasePointerCapture = jest.fn()
})

afterEach(() => {
  jest.restoreAllMocks()
})

const renderEditor = (onConfirm = jest.fn(), onCancel = jest.fn()) => {
  render(
    <CornerCropEditor
      imageUrl="blob:mock"
      onConfirm={onConfirm}
      onCancel={onCancel}
    />,
  )
  return { onConfirm, onCancel }
}

describe('CornerCropEditor', () => {
  it('shows loading, then the image with 4 handles', async () => {
    renderEditor()
    expect(screen.getByText(/preparing image/i)).toBeInTheDocument()
    await waitFor(() =>
      expect(screen.getByAltText('Textbook cover')).toHaveAttribute(
        'src',
        'data:image/jpeg;base64,PROCESSED',
      ),
    )
    expect(
      screen.getAllByRole('button', { name: /drag corner/i }),
    ).toHaveLength(4)
  })

  it('falls back to the original image when background removal returns null', async () => {
    mockRemoveBg.mockReturnValue(null)
    renderEditor()
    expect(await screen.findByAltText('Textbook cover')).toHaveAttribute(
      'src',
      'blob:mock',
    )
  })

  it('shows an error and still renders the image if removal throws', async () => {
    mockRemoveBg.mockImplementation(() => {
      throw new Error('nope')
    })
    jest.spyOn(console, 'error').mockImplementation(() => {})
    renderEditor()
    expect(await screen.findByRole('alert')).toHaveTextContent(
      /background removal unavailable/i,
    )
    expect(screen.getByAltText('Textbook cover')).toHaveAttribute(
      'src',
      'blob:mock',
    )
  })

  it('calls onCancel when Cancel is clicked', async () => {
    const { onCancel } = renderEditor()
    await screen.findByAltText('Textbook cover')
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onCancel).toHaveBeenCalled()
  })

  it('calls onConfirm with a cropped data URL', async () => {
    const { onConfirm } = renderEditor()
    await screen.findByAltText('Textbook cover')
    await userEvent.click(
      screen.getByRole('button', { name: /confirm crop/i }),
    )
    await waitFor(() =>
      expect(onConfirm).toHaveBeenCalledWith('data:image/jpeg;base64,CROPPED'),
    )
  })
})