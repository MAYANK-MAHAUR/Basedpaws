import { PhotoCard } from './PhotoCard'

export function PhotoGallery({ photos, loading }) {
    if (loading) {
        return (
            <div className="gallery-section">
                <div className="gallery-header">
                    <h2 className="gallery-title"><span>🏆</span> Top Funny Pets</h2>
                </div>
                <div className="gallery-empty">
                    <div className="spinner" style={{ width: 32, height: 32, margin: '0 auto' }}></div>
                    <p style={{ marginTop: '1rem' }}>Loading adorable pets...</p>
                </div>
            </div>
        )
    }

    if (!photos || photos.length === 0) {
        return (
            <div className="gallery-section">
                <div className="gallery-header">
                    <h2 className="gallery-title"><span>🏆</span> Top Funny Pets</h2>
                </div>
                <div className="gallery-empty">
                    <div className="empty-icon">🐾</div>
                    <h3>No pets yet!</h3>
                    <p>Be the first to share a funny pet photo</p>
                </div>
            </div>
        )
    }

    return (
        <div className="gallery-section">
            <div className="gallery-header">
                <h2 className="gallery-title"><span>🏆</span> Top Funny Pets</h2>
                <span className="gallery-count">{photos.length} photos</span>
            </div>
            <div className="photo-grid">
                {photos.map((photo, index) => (
                    <PhotoCard key={photo.id} photo={photo} rank={index + 1} />
                ))}
            </div>
        </div>
    )
}
