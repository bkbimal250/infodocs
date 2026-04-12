import React, { useState, useRef } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button, Label } from '../../ui';

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
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-2">
          📄 Documents Upload
        </h2>
        <p className="text-xs sm:text-sm text-gray-500">
          Upload and crop required documents clearly
        </p>
      </div>

      <div className="space-y-5">

        {/* Passport Photo */}
        <div className="bg-gray-50 border rounded-xl p-4">
          <Label>Passport Size Photo</Label>

          <input
            ref={el => fileInputRefs.current.passport_size_photo = el}
            type="file"
            name="passport_size_photo"
            accept="image/*"
            onChange={(e) => handleImageChange(e, 'passport_size_photo')}
            className="mt-2 w-full text-sm file:mr-3 file:py-2 file:px-4 
                     file:rounded-lg file:border-0 file:bg-blue-600 file:text-white 
                     hover:file:bg-blue-700 cursor-pointer"
          />

          {files.passport_size_photo && !showCrop.passport_size_photo && (
            <p className="mt-2 text-xs text-green-600">✓ Photo selected</p>
          )}

          {/* Crop UI */}
          {showCrop.passport_size_photo && imageSrcs.passport_size_photo && (
            <div className="mt-4 bg-white border rounded-lg p-3 shadow-sm">
              <p className="text-xs text-gray-600 mb-2">
                Crop Passport Photo
              </p>

              <div className="flex justify-center overflow-auto">
                <ReactCrop
                  crop={cropStates.passport_size_photo}
                  onChange={(c) => setCropStates(prev => ({ ...prev, passport_size_photo: c }))}
                  onComplete={(c) => setCompletedCrops(prev => ({ ...prev, passport_size_photo: c }))}
                  aspect={45 / 55}
                >
                  <img
                    ref={el => imgRefs.current.passport_size_photo = el}
                    src={imageSrcs.passport_size_photo}
                    className="max-h-[300px] sm:max-h-[400px] rounded"
                  />
                </ReactCrop>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 justify-end mt-3">
                <Button onClick={() => handleCancelCrop('passport_size_photo')} variant="secondary">
                  Cancel
                </Button>
                <Button onClick={() => handleCropComplete('passport_size_photo')} variant="primary">
                  Apply Crop
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Age Proof */}
        <div className="bg-gray-50 border rounded-xl p-4">
          <Label required>Age Proof Document</Label>

          <input
            type="file"
            name="age_proof_document"
            accept="image/*,.pdf"
            onChange={handleFileChange}
            required
            className="mt-2 w-full text-sm file:mr-3 file:py-2 file:px-4 
                     file:rounded-lg file:border-0 file:bg-blue-600 file:text-white 
                     hover:file:bg-blue-700 cursor-pointer"
          />
        </div>

        {/* Aadhar Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {['aadhar_card_front', 'aadhar_card_back'].map((field) => (
            <div key={field} className="bg-gray-50 border rounded-xl p-4">
              <Label>
                {field === 'aadhar_card_front' ? 'Aadhar Front' : 'Aadhar Back'}
              </Label>

              <input
                ref={el => fileInputRefs.current[field] = el}
                type="file"
                name={field}
                accept="image/*"
                onChange={(e) => handleImageChange(e, field)}
                className="mt-2 w-full text-sm file:mr-3 file:py-2 file:px-4 
                         file:rounded-lg file:border-0 file:bg-blue-600 file:text-white 
                         hover:file:bg-blue-700 cursor-pointer"
              />

              {files[field] && !showCrop[field] && (
                <p className="mt-2 text-xs text-green-600">✓ Image selected</p>
              )}

              {showCrop[field] && imageSrcs[field] && (
                <div className="mt-3 bg-white border rounded-lg p-3">
                  <ReactCrop
                    crop={cropStates[field]}
                    onChange={(c) => setCropStates(prev => ({ ...prev, [field]: c }))}
                    onComplete={(c) => setCompletedCrops(prev => ({ ...prev, [field]: c }))}
                  >
                    <img
                      ref={el => imgRefs.current[field] = el}
                      src={imageSrcs[field]}
                      className="max-h-[250px] rounded"
                    />
                  </ReactCrop>

                  <div className="flex flex-col sm:flex-row gap-2 justify-end mt-3">
                    <Button onClick={() => handleCancelCrop(field)} variant="secondary">
                      Cancel
                    </Button>
                    <Button onClick={() => handleCropComplete(field)} variant="primary">
                      Apply
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}

        </div>

        {/* PAN Card */}
        <div className="bg-gray-50 border rounded-xl p-4">
          <Label>PAN Card</Label>

          <input
            ref={el => fileInputRefs.current.pan_card = el}
            type="file"
            name="pan_card"
            accept="image/*"
            onChange={(e) => handleImageChange(e, 'pan_card')}
            className="mt-2 w-full text-sm file:mr-3 file:py-2 file:px-4 
                     file:rounded-lg file:border-0 file:bg-blue-600 file:text-white 
                     hover:file:bg-blue-700 cursor-pointer"
          />

          {files.pan_card && !showCrop.pan_card && (
            <p className="mt-2 text-xs text-green-600">✓ Selected</p>
          )}
        </div>

        {/* Signature */}
        <div className="bg-gray-50 border rounded-xl p-4">
          <Label required>Signature</Label>

          <input
            ref={el => fileInputRefs.current.signature = el}
            type="file"
            name="signature"
            accept="image/*"
            onChange={(e) => handleImageChange(e, 'signature')}
            required
            className="mt-2 w-full text-sm file:mr-3 file:py-2 file:px-4 
                     file:rounded-lg file:border-0 file:bg-blue-600 file:text-white 
                     hover:file:bg-blue-700 cursor-pointer"
          />

          {files.signature && !showCrop.signature && (
            <p className="mt-2 text-xs text-green-600">✓ Signature uploaded</p>
          )}
        </div>

        {/* Additional Docs */}
        <div className="bg-gray-50 border rounded-xl p-4">
          <Label>Additional Documents</Label>

          <input
            type="file"
            name="documents"
            multiple
            accept="image/*,.pdf"
            onChange={handleFileChange}
            className="mt-2 w-full text-sm file:mr-3 file:py-2 file:px-4 
                     file:rounded-lg file:border-0 file:bg-blue-600 file:text-white 
                     hover:file:bg-blue-700 cursor-pointer"
          />
        </div>

      </div>
    </div>
  );
};

export default DocumentUpload;
