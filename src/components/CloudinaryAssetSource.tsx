/* eslint-disable camelcase */
import React from 'react'
import { Dialog, Spinner, Stack, Flex, Text, Box, Card } from '@sanity/ui'
import pluginConfig from 'config:asset-source-cloudinary'
import { Asset, AssetDocument, CloudinaryAsset, CloudinaryMediaLibrary } from '../types'
import { loadCloudinary, decodeSourceId, encodeFilename, encodeSourceId } from '../utils'
import { Widget } from './CloudinaryAssetSource.styled'

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
  hasConfig: boolean
}

export default class CloudinaryAssetSource extends React.Component<Props, State> {
  static defaultProps = {
    selectedAssets: undefined
  }

  state = {
    loadingMessage: 'Loading Cloudinary Media Libary',
    hasConfig: false
  }

  private contentRef = React.createRef<HTMLDivElement>()

  private library: CloudinaryMediaLibrary | null = null

  private domId = Date.now()

  componentDidMount() {
    const hasConfig = !!(pluginConfig.cloudName && pluginConfig.apiKey)
    this.setState({ hasConfig }, () => hasConfig && loadCloudinary(this.setupMediaLibrary))
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
          firstSelectedAsset.source &&
          firstSelectedAsset.source.id
        ) {
          asset = decodeSourceId(firstSelectedAsset.source.id)
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
      imageAssets.map((asset: CloudinaryAsset) => {
        const url = asset.derived && asset.derived[0] ? asset.derived[0].secure_url : asset.secure_url
        return {
          kind: 'url',
          value: url,
          assetDocumentProps: {
            originalFilename: encodeFilename(asset),
            source: {
              id: encodeSourceId(asset),
              name: `cloudinary:${pluginConfig.cloudName}`
            }
          }
        }
      }
    ))
  }

  handleClose = () => {
    if (this.library) {
      this.library.hide()
    }
    this.props.onClose()
  }

  renderConfigWarning() {
    return (
      <Card tone="caution" padding={4} radius={2}>
        <Stack space={4}>
          <Text as="h1" weight="semibold">
            Missing configuration
          </Text>
          <Text>
            You must first configure the plugin with your Cloudinary credentials. Edit the{' '}
            <code>./config/asset-source-cloudinary.json</code> file in your Sanity Studio folder.
          </Text>
          <Text>
          You can get your credentials by visiting the{' '}
          <a href="https://cloudinary.com/console" rel="noopener noreferrer" target="_blank">
            Cloudinary console
          </a>{' '}
          and get your Cloud name and API key.
          </Text>
        </Stack>
      </Card>
    )
  }

  render() {
    const { hasConfig, loadingMessage } = this.state
    return (
      <Dialog
        id="cloudinary-asset-source"
        header="Select image from Cloudinary"
        onClose={this.handleClose}
        open
        width={hasConfig ? 4 : 1}
      >
        <Box padding={4}>
          {hasConfig && loadingMessage && (
            <Stack space={3}>
              <Flex align="center" justify="center">
                <Spinner muted />
              </Flex>
              <Text size={1} muted align="center">
                {loadingMessage}
              </Text>
            </Stack>
          )}
        {hasConfig && (
            <Widget
            style={{ visibility: 'hidden' }}
            ref={this.contentRef}
            id={`cloundinaryWidget-${this.domId}`}
          />
        )}
        {!hasConfig && this.renderConfigWarning()}
        </Box>
      </Dialog>
    )
  }
}
