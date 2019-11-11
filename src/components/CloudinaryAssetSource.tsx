/* eslint-disable camelcase */
import React from 'react'
import Dialog from 'part:@sanity/components/dialogs/fullscreen'
import Spinner from 'part:@sanity/components/loading/spinner'
import pluginConfig from 'config:asset-source-cloudinary'

import { Asset, AssetDocument, CloudinaryAsset, CloudinaryMediaLibrary } from '../types'
import { loadCloudinary, decodeLabel, encodeLabel, encodeFilename } from '../utils'
import styles from './CloudinaryAssetSource.css'

declare global {
  interface Window {
    cloudinary: any
  }
}

window.cloudinary = window.cloudinary || {}

type Props = {
  onSelect: (assets: Asset[]) => void
  onClose: () => void
  selectedAssets?: AssetDocument[]
  selectionType: 'single' | 'multiple'
}

type State = {
  loadingMessage: string | null
}

export default class CloudinaryAssetSource extends React.Component<Props, State> {
  static defaultProps = {
    selectedAssets: undefined
  }

  state = {
    loadingMessage: 'Loading Cloudinary Media Libary'
  }

  private contentRef = React.createRef<HTMLDivElement>()

  private library: CloudinaryMediaLibrary | null = null

  private domId = Date.now()

  componentDidMount() {
    loadCloudinary(this.setupMediaLibrary)
  }

  private setupMediaLibrary = () => {
    const { selectedAssets, selectionType } = this.props
    const firstSelectedAsset = selectedAssets ? selectedAssets[0] : null
    this.library = window.cloudinary.createMediaLibrary(
      {
        cloud_name: pluginConfig.cloudName,
        api_key: pluginConfig.apiKey,
        inline_container: `#cloundinaryWidget-${this.domId}`,
        remove_header: true,
        insert_caption: 'Select'
      },
      {
        insertHandler: this.handleSelect
      }
    )
    const iframe: ChildNode | null = this.contentRef.current && this.contentRef.current.firstChild
    if (iframe && iframe instanceof HTMLIFrameElement) {
      iframe.onload = () => {
        this.setState({ loadingMessage: null })
        let asset
        if (
          selectionType === 'single' &&
          firstSelectedAsset &&
          firstSelectedAsset.label
        ) {
          asset = decodeLabel(firstSelectedAsset.label)
        }
        const folder = asset
          ? {
              path: asset.public_id
                .split('/')
                .slice(0, -1)
                .join('/'),
              resource_type: 'image'
            }
          : { path: '', resource_type: 'image' }
        if (this.library && this.contentRef.current) {
          this.library.show({ folder, asset })
          this.contentRef.current.style.visibility = 'visible'
        }
      }
    }
  }

  handleSelect = ({ assets }: any) => {
    if (!this.library) {
      return
    }
    const imageAssets = assets.filter((asset: CloudinaryAsset) => asset.resource_type === 'image')
    if (imageAssets.length === 0) {
      throw new Error('The selection did not contain any images.')
    }
    this.library.hide()
    this.props.onSelect(
      imageAssets.map((asset: CloudinaryAsset) => ({
        kind: 'url',
        value: asset.secure_url,
        options: {
          label: encodeLabel(asset),
          originalFilename: encodeFilename(asset)
        }
      }))
    )
  }

  handleClose = () => {
    if (this.library) {
      this.library.hide()
    }
    this.props.onClose()
  }

  render() {
    return (
      <Dialog title="Select image from Cloudinary" onClose={this.handleClose} isOpen>
        {this.state.loadingMessage && (
          <Spinner fullscreen center message={this.state.loadingMessage} />
        )}
        <div
          style={{ visibility: 'hidden' }}
          ref={this.contentRef}
          className={styles.widget}
          id={`cloundinaryWidget-${this.domId}`}
        />
      </Dialog>
    )
  }
}
