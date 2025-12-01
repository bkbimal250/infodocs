import React, { useState, useRef } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

/**
 * Document Upload Component
 * Handles all file uploads with image cropping for all image fields
 */
const DocumentUpload = ({ files, handleFileChange, setFiles }) => {
  // State for each image crop
  const [cropStates, setCropStates] = useState({});
  const [imageSrcs, setImageSrcs] = useState({});
  const [showCrop, setShowCrop] = useState({});
  const [completedCrops, setCompletedCrops] = useState({});
  const imgRefs = useRef({});
  const fileInputRefs = useRef({});

  // Image field configurations
  const imageFields = {
    passport_size_photo: { aspect: 45 / 55, label: 'Passport Photo (45mm x 55mm)' },
    signature: { aspect: null, label: 'Signature' },
    aadhar_card_front: { aspect: null, label: 'Aadhar Card Front' },
    aadhar_card_back: { aspect: null, label: 'Aadhar Card Back' },
    pan_card: { aspect: null, label: 'PAN Card' },
  };

  // Initialize crop state for a field
  const initializeCrop = (fieldName) => {
    const config = imageFields[fieldName];
    return {
      unit: '%',
      width: 90,
      ...(config.aspect && { aspect: config.aspect })
    };
  };

  // Handle image upload with crop
  const handleImageChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file && fieldName in imageFields) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrcs(prev => ({ ...prev, [fieldName]: reader.result }));
        setShowCrop(prev => ({ ...prev, [fieldName]: true }));
        setCropStates(prev => ({ ...prev, [fieldName]: initializeCrop(fieldName) }));
      };
      reader.readAsDataURL(file);
    } else {
      // For non-image fields or PDFs, use regular file change
      handleFileChange(e);
    }
  };

  // Get cropped image
  const getCroppedImg = (image, crop, fieldName) => {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width * scaleX;
    canvas.height = crop.height * scaleY;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width * scaleX,
      crop.height * scaleY
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          console.error('Canvas is empty');
          return;
        }
        resolve(blob);
      }, 'image/jpeg');
    });
  };

  // Apply crop
  const handleCropComplete = async (fieldName) => {
    const imgRef = imgRefs.current[fieldName];
    const completedCrop = completedCrops[fieldName];
    
    if (!imgRef || !completedCrop) {
      return;
    }

    try {
      const croppedImageBlob = await getCroppedImg(imgRef, completedCrop, fieldName);
      const fileName = fieldName === 'passport_size_photo' 
        ? 'passport_photo.jpg' 
        : `${fieldName}.jpg`;
      const croppedFile = new File([croppedImageBlob], fileName, { type: 'image/jpeg' });
      
      // Update files state directly
      setFiles((prev) => ({
        ...prev,
        [fieldName]: croppedFile
      }));
      
      setShowCrop(prev => ({ ...prev, [fieldName]: false }));
      setImageSrcs(prev => {
        const newSrcs = { ...prev };
        delete newSrcs[fieldName];
        return newSrcs;
      });
      setCompletedCrops(prev => {
        const newCrops = { ...prev };
        delete newCrops[fieldName];
        return newCrops;
      });
    } catch (error) {
      console.error('Error cropping image:', error);
    }
  };

  // Cancel crop
  const handleCancelCrop = (fieldName) => {
    setShowCrop(prev => ({ ...prev, [fieldName]: false }));
    setImageSrcs(prev => {
      const newSrcs = { ...prev };
      delete newSrcs[fieldName];
      return newSrcs;
    });
    setCompletedCrops(prev => {
      const newCrops = { ...prev };
      delete newCrops[fieldName];
      return newCrops;
    });
    if (fileInputRefs.current[fieldName]) {
      fileInputRefs.current[fieldName].value = '';
    }
  };

  return (
    <div className="border-b border-gray-200 pb-3">
      <h2 className="text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Documents
      </h2>
      <div className="space-y-2">
        {/* Passport Size Photo with Crop */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Passport Size Photo
          </label>
          <input
            ref={el => fileInputRefs.current.passport_size_photo = el}
            type="file"
            name="passport_size_photo"
            accept="image/*"
            onChange={(e) => handleImageChange(e, 'passport_size_photo')}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
          />
          {showCrop.passport_size_photo && imageSrcs.passport_size_photo && (
            <div className="mt-3 p-3 border border-gray-300 rounded bg-gray-50">
              <div className="mb-2">
                <p className="text-xs text-gray-600 mb-2">Crop your {imageFields.passport_size_photo.label}:</p>
                <div className="flex justify-center">
                  <ReactCrop
                    crop={cropStates.passport_size_photo}
                    onChange={(c) => setCropStates(prev => ({ ...prev, passport_size_photo: c }))}
                    onComplete={(c) => setCompletedCrops(prev => ({ ...prev, passport_size_photo: c }))}
                    aspect={45 / 55}
                    minWidth={100}
                  >
                    <img
                      ref={el => imgRefs.current.passport_size_photo = el}
                      alt="Crop passport photo"
                      src={imageSrcs.passport_size_photo}
                      style={{ maxHeight: '400px' }}
                      onLoad={() => {
                        if (imgRefs.current.passport_size_photo) {
                          setCropStates(prev => ({
                            ...prev,
                            passport_size_photo: initializeCrop('passport_size_photo')
                          }));
                        }
                      }}
                    />
                  </ReactCrop>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => handleCancelCrop('passport_size_photo')}
                  className="px-3 py-1.5 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleCropComplete('passport_size_photo')}
                  className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Apply Crop
                </button>
              </div>
            </div>
          )}
          {files.passport_size_photo && !showCrop.passport_size_photo && (
            <p className="mt-1 text-xs text-green-600">✓ Photo selected</p>
          )}
        </div>

        {/* Age Proof Document (PDF or Image) */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Age Proof Document *
          </label>
          <input
            type="file"
            name="age_proof_document"
            accept="image/*,.pdf"
            onChange={handleFileChange}
            required
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Aadhar Card Front with Crop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Aadhar Card Front
            </label>
            <input
              ref={el => fileInputRefs.current.aadhar_card_front = el}
              type="file"
              name="aadhar_card_front"
              accept="image/*"
              onChange={(e) => handleImageChange(e, 'aadhar_card_front')}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
            />
            {showCrop.aadhar_card_front && imageSrcs.aadhar_card_front && (
              <div className="mt-3 p-3 border border-gray-300 rounded bg-gray-50">
                <div className="mb-2">
                  <p className="text-xs text-gray-600 mb-2">Crop your {imageFields.aadhar_card_front.label}:</p>
                  <div className="flex justify-center">
                    <ReactCrop
                      crop={cropStates.aadhar_card_front}
                      onChange={(c) => setCropStates(prev => ({ ...prev, aadhar_card_front: c }))}
                      onComplete={(c) => setCompletedCrops(prev => ({ ...prev, aadhar_card_front: c }))}
                      minWidth={100}
                    >
                      <img
                        ref={el => imgRefs.current.aadhar_card_front = el}
                        alt="Crop aadhar front"
                        src={imageSrcs.aadhar_card_front}
                        style={{ maxHeight: '400px' }}
                        onLoad={() => {
                          if (imgRefs.current.aadhar_card_front) {
                            setCropStates(prev => ({
                              ...prev,
                              aadhar_card_front: initializeCrop('aadhar_card_front')
                            }));
                          }
                        }}
                      />
                    </ReactCrop>
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => handleCancelCrop('aadhar_card_front')}
                    className="px-3 py-1.5 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCropComplete('aadhar_card_front')}
                    className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Apply Crop
                  </button>
                </div>
              </div>
            )}
            {files.aadhar_card_front && !showCrop.aadhar_card_front && (
              <p className="mt-1 text-xs text-green-600">✓ Image selected</p>
            )}
          </div>
          
          {/* Aadhar Card Back with Crop */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Aadhar Card Back
            </label>
            <input
              ref={el => fileInputRefs.current.aadhar_card_back = el}
              type="file"
              name="aadhar_card_back"
              accept="image/*"
              onChange={(e) => handleImageChange(e, 'aadhar_card_back')}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
            />
            {showCrop.aadhar_card_back && imageSrcs.aadhar_card_back && (
              <div className="mt-3 p-3 border border-gray-300 rounded bg-gray-50">
                <div className="mb-2">
                  <p className="text-xs text-gray-600 mb-2">Crop your {imageFields.aadhar_card_back.label}:</p>
                  <div className="flex justify-center">
                    <ReactCrop
                      crop={cropStates.aadhar_card_back}
                      onChange={(c) => setCropStates(prev => ({ ...prev, aadhar_card_back: c }))}
                      onComplete={(c) => setCompletedCrops(prev => ({ ...prev, aadhar_card_back: c }))}
                      minWidth={100}
                    >
                      <img
                        ref={el => imgRefs.current.aadhar_card_back = el}
                        alt="Crop aadhar back"
                        src={imageSrcs.aadhar_card_back}
                        style={{ maxHeight: '400px' }}
                        onLoad={() => {
                          if (imgRefs.current.aadhar_card_back) {
                            setCropStates(prev => ({
                              ...prev,
                              aadhar_card_back: initializeCrop('aadhar_card_back')
                            }));
                          }
                        }}
                      />
                    </ReactCrop>
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => handleCancelCrop('aadhar_card_back')}
                    className="px-3 py-1.5 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCropComplete('aadhar_card_back')}
                    className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Apply Crop
                  </button>
                </div>
              </div>
            )}
            {files.aadhar_card_back && !showCrop.aadhar_card_back && (
              <p className="mt-1 text-xs text-green-600">✓ Image selected</p>
            )}
          </div>
        </div>

        {/* PAN Card with Crop */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">PAN Card</label>
          <input
            ref={el => fileInputRefs.current.pan_card = el}
            type="file"
            name="pan_card"
            accept="image/*"
            onChange={(e) => handleImageChange(e, 'pan_card')}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
          />
          {showCrop.pan_card && imageSrcs.pan_card && (
            <div className="mt-3 p-3 border border-gray-300 rounded bg-gray-50">
              <div className="mb-2">
                <p className="text-xs text-gray-600 mb-2">Crop your {imageFields.pan_card.label}:</p>
                <div className="flex justify-center">
                  <ReactCrop
                    crop={cropStates.pan_card}
                    onChange={(c) => setCropStates(prev => ({ ...prev, pan_card: c }))}
                    onComplete={(c) => setCompletedCrops(prev => ({ ...prev, pan_card: c }))}
                    minWidth={100}
                  >
                    <img
                      ref={el => imgRefs.current.pan_card = el}
                      alt="Crop pan card"
                      src={imageSrcs.pan_card}
                      style={{ maxHeight: '400px' }}
                      onLoad={() => {
                        if (imgRefs.current.pan_card) {
                          setCropStates(prev => ({
                            ...prev,
                            pan_card: initializeCrop('pan_card')
                          }));
                        }
                      }}
                    />
                  </ReactCrop>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => handleCancelCrop('pan_card')}
                  className="px-3 py-1.5 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleCropComplete('pan_card')}
                  className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Apply Crop
                </button>
              </div>
            </div>
          )}
          {files.pan_card && !showCrop.pan_card && (
            <p className="mt-1 text-xs text-green-600">✓ Image selected</p>
          )}
        </div>

        {/* Signature with Crop */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Signature *</label>
          <input
            ref={el => fileInputRefs.current.signature = el}
            type="file"
            name="signature"
            accept="image/*"
            onChange={(e) => handleImageChange(e, 'signature')}
            required
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
          />
          {showCrop.signature && imageSrcs.signature && (
            <div className="mt-3 p-3 border border-gray-300 rounded bg-gray-50">
              <div className="mb-2">
                <p className="text-xs text-gray-600 mb-2">Crop your {imageFields.signature.label}:</p>
                <div className="flex justify-center">
                  <ReactCrop
                    crop={cropStates.signature}
                    onChange={(c) => setCropStates(prev => ({ ...prev, signature: c }))}
                    onComplete={(c) => setCompletedCrops(prev => ({ ...prev, signature: c }))}
                    minWidth={100}
                  >
                    <img
                      ref={el => imgRefs.current.signature = el}
                      alt="Crop signature"
                      src={imageSrcs.signature}
                      style={{ maxHeight: '400px' }}
                      onLoad={() => {
                        if (imgRefs.current.signature) {
                          setCropStates(prev => ({
                            ...prev,
                            signature: initializeCrop('signature')
                          }));
                        }
                      }}
                    />
                  </ReactCrop>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => handleCancelCrop('signature')}
                  className="px-3 py-1.5 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleCropComplete('signature')}
                  className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Apply Crop
                </button>
              </div>
            </div>
          )}
          {files.signature && !showCrop.signature && (
            <p className="mt-1 text-xs text-green-600">✓ Signature selected</p>
          )}
        </div>

        {/* Additional Documents */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Additional Documents
          </label>
          <input
            type="file"
            name="documents"
            multiple
            accept="image/*,.pdf"
            onChange={handleFileChange}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
};

export default DocumentUpload;
