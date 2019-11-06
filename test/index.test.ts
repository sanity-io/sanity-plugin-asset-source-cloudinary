import index from '../src/index'
import CloudinaryAssetSource from '../src/components/CloudinaryAssetSource'

describe('index', () => {
  it('has a name', () => {
    expect(index.name).toBe('cloudinary')
  })
  it('has a component', () => {
    expect(index.component).toBe(CloudinaryAssetSource)
  })
})
