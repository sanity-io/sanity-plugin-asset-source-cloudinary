import CloudinaryAssetSource from '../src/components/CloudinaryAssetSource'

describe('CloudinaryAssetSource', () => {
  it('CloudinaryAssetSource is instantiable', () => {
    expect(
      new CloudinaryAssetSource({
        onSelect: () => void 0,
        onClose: () => void 0,
        selectionType: 'single'
      })
    ).toBeInstanceOf(CloudinaryAssetSource)
  })
})
