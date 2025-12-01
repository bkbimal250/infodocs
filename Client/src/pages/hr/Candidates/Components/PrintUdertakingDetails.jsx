import React, { useRef, useState, useEffect } from "react";
const PrintUdertakingDetails = ({ data = {}, onDownload }) => {
    const candidate = data.candidate || data;
    const printRef = useRef(null);
    const [imageCache, setImageCache] = useState({});

    const employeeName = `${candidate.first_name || ""} ${candidate.middle_name || ""} ${candidate.last_name || ""}`.trim();
    const designation = candidate.position_applied_for || "";
    const companyName = candidate.spa?.name || candidate.spa_name_text || "";
    const date = candidate.created_at ? new Date(candidate.created_at).toLocaleDateString() : new Date().toLocaleDateString();

    const getFileUrl = (filePath) => {
        if (!filePath) return null;
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
        let cleanPath = filePath;
        if (filePath.startsWith('uploads/')) {
            cleanPath = filePath.replace('uploads/', '');
        } else if (filePath.startsWith('/uploads/')) {
            cleanPath = filePath.replace('/uploads/', '');
        }
        const url = `${apiBaseUrl}/forms/files/${cleanPath}`;
        return url;
    };

    const fetchImageAsDataUrl = async (filePath) => {
        if (!filePath) return null;
        if (imageCache[filePath]) {
            return imageCache[filePath];
        }
        try {
            const url = getFileUrl(filePath);
            if (!url) return null;
            const response = await fetch(url, {
                method: 'GET',
                credentials: 'include',
            });
            if (!response.ok) {
                console.warn('Failed to fetch image:', url);
                return null;
            }
            const blob = await response.blob();
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const dataUrl = reader.result;
                    setImageCache(prev => ({ ...prev, [filePath]: dataUrl }));
                    resolve(dataUrl);
                };
                reader.onerror = () => {
                    console.warn('Failed to convert image to data URL:', url);
                    resolve(null);
                };
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.warn('Error fetching image:', error);
            return null;
        }
    };

    useEffect(() => {
        const preloadImages = async () => {
            if (candidate.signature) {
                await fetchImageAsDataUrl(candidate.signature);
            }
            if (candidate.passport_size_photo) {
                await fetchImageAsDataUrl(candidate.passport_size_photo);
            }
        };
        preloadImages();
    }, [candidate.signature, candidate.passport_size_photo]);

    const handleDownload = () => {
        if (onDownload && printRef.current) {
            onDownload(printRef.current);
        }
    };

    const handlePrint = () => {
        if (!printRef.current) return;
        const clonedElement = printRef.current.cloneNode(true);
        const printWindow = window.open('', '_blank');
        const styles = Array.from(document.styleSheets)
            .map(styleSheet => {
                try {
                    return Array.from(styleSheet.cssRules)
                        .map(rule => rule.cssText)
                        .join('\n');
                } catch (e) {
                    return '';
                }
            })
            .join('\n');
        const printContent = clonedElement.outerHTML;
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Undertaking Form - Print</title>
                    <style>
                        ${styles}
                        @media print {
                            @page {
                                size: A4;
                                margin: 15mm 20mm;
                            }
                            body {
                                margin: 0;
                                padding: 0;
                            }
                            * {
                                -webkit-print-color-adjust: exact !important;
                                print-color-adjust: exact !important;
                                color-adjust: exact !important;
                            }
                            img {
                                -webkit-print-color-adjust: exact !important;
                                print-color-adjust: exact !important;
                                page-break-inside: avoid !important;
                                break-inside: avoid !important;
                            }
                            .page-break {
                                page-break-before: always;
                                break-before: page;
                            }
                            .flex {
                                display: flex !important;
                            }
                            .flex-1 {
                                flex: 1 1 0% !important;
                            }
                            .items-center {
                                align-items: center !important;
                            }
                            .justify-center {
                                justify-content: center !important;
                            }
                        }
                        body {
                            font-family: 'Times New Roman', serif;
                            font-size: 13px;
                            line-height: 1.4;
                            padding: 0;
                            margin: 0;
                        }
                        .a4-page {
                            width: 210mm;
                            min-height: 297mm;
                            padding: 15mm 20mm;
                            margin: 0 auto;
                            background: white;
                            box-sizing: border-box;
                        }
                        img {
                            display: block;
                        }
                    </style>
                </head>
                <body>
                    ${printContent}
                </body>
            </html>
        `);
        printWindow.document.close();
        const waitForImages = () => {
            const images = printWindow.document.querySelectorAll('img');
            if (images.length === 0) {
                setTimeout(() => {
                    printWindow.print();
                    setTimeout(() => printWindow.close(), 1000);
                }, 300);
                return;
            }
            const imagePromises = Array.from(images).map((img) => {
                return new Promise((resolve) => {
                    if (img.complete && img.naturalHeight !== 0) {
                        resolve();
                    } else {
                        img.onload = () => resolve();
                        img.onerror = () => resolve();
                    }
                });
            });
            Promise.all(imagePromises).then(() => {
                setTimeout(() => {
                    printWindow.print();
                    setTimeout(() => {
                        printWindow.close();
                    }, 1000);
                }, 500);
            });
        };
        if (printWindow.document.readyState === 'complete') {
            waitForImages();
        } else {
            printWindow.onload = waitForImages;
        }
    };

    return (
        <>
            <style>{`
                @media print {
                    @page {
                        size: A4;
                        margin: 15mm 20mm;
                    }
                    body {
                        margin: 0;
                        padding: 0;
                    }
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        color-adjust: exact !important;
                    }
                    img {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                    }
                    .page-break {
                        page-break-before: always;
                        break-before: page;
                    }
                    .flex {
                        display: flex !important;
                    }
                    .flex-1 {
                        flex: 1 1 0% !important;
                    }
                    .items-center {
                        align-items: center !important;
                    }
                    .justify-center {
                        justify-content: center !important;
                    }
                }
                .a4-page {
                    width: 210mm;
                    min-height: 297mm;
                    padding: 15mm 20mm;
                    margin: 0 auto;
                    background: white;
                    box-sizing: border-box;
                }
                @media screen {
                    .a4-page {
                        box-shadow: 0 0 10px rgba(0,0,0,0.1);
                    }
                }
                .a4-page img {
                    display: block;
                }
            `}</style>
            <div className="print-container">
                <div ref={printRef} className="a4-page text-[13px] leading-tight font-[Times_New_Roman]">
                    <h2 className="text-center uppercase font-bold text-lg mb-3 mt-0">
                        Undertaking Form
                    </h2>
                    <div className="mb-3">
                        <div className="mb-2">
                            <p className="text-justify leading-tight">
                                I, <strong>{employeeName}</strong>, employee working as <strong>{designation}</strong> at{" "}
                                <strong>{companyName}</strong>, hereby undertake as follows:
                            </p>
                        </div>
                        <div className="mb-2">
                            <h3 className="font-semibold mb-1.5 text-[13px]">UNDERTAKING:</h3>
                            <div className="mb-1">
                                <span className="inline-block w-6">1.</span>
                                <span className="ml-2">I will faithfully and diligently perform the duties assigned to me.</span>
                            </div>
                            <div className="mb-1">
                                <span className="inline-block w-6">2.</span>
                                <span className="ml-2">I hereby state that I am over 18 years old and have submitted a government-approved age-proof document.</span>
                            </div>
                            <div className="mb-1">
                                <span className="inline-block w-6">3.</span>
                                <span className="ml-2">I will comply with all company rules, regulations, policies, and procedures.</span>
                            </div>
                            <div className="mb-1">
                                <span className="inline-block w-6">4.</span>
                                <span className="ml-2">I will not engage in any activity that conflicts with the company's interests.</span>
                            </div>
                            <div className="mb-1">
                                <span className="inline-block w-6">5.</span>
                                <span className="ml-2">I will maintain professional conduct and decorum within and outside the workplace.</span>
                            </div>
                            <div className="mb-1">
                                <span className="inline-block w-6">6.</span>
                                <span className="ml-2">I understand that any breach of this undertaking may result in disciplinary action, including termination.</span>
                            </div>
                            <div className="mb-1">
                                <span className="inline-block w-6">7.</span>
                                <span className="ml-2">My signature is given freely without force, fraud, or undue influence.</span>
                            </div>
                        </div>
                        <div className="mb-2">
                            <h3 className="font-semibold mb-1.5 text-[13px]">DECLARATION:</h3>
                            <p className="text-justify leading-tight text-[12px]">
                                I hereby declare that the information given by me to the employer is true, complete and
                                correct to the best of my knowledge and belief and that nothing has been concealed or
                                distorted. If at any point of time, I am found to have concealed/distorted any information or
                                given any false statement, my appointment shall liable to be summarily
                                rejected/terminated without notice or compensation.
                            </p>
                        </div>
                    </div>
                    <div className="page-break"></div>
                    <div className="mb-2">
                        <div className="mb-2">
                            <h3 className="font-semibold mb-1.5 text-[13px]">SIGNATURES:</h3>
                            <div className="mb-2 flex gap-4">
                                <div className="flex-1">
                                    <span>Employee Signature</span>
                                    <div className="border-b border-black mt-0.5 min-h-[60px] pb-1 flex items-center" style={{ position: 'relative', overflow: 'hidden' }}>
                                        {candidate.signature && imageCache[candidate.signature] ? (
                                            <img
                                                src={imageCache[candidate.signature]}
                                                alt="Signature"
                                                style={{
                                                    maxHeight: '55px',
                                                    maxWidth: '100%',
                                                    objectFit: 'contain',
                                                    display: 'block',
                                                    position: 'relative'
                                                }}
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                }}
                                            />
                                        ) : candidate.signature ? (
                                            <img
                                                src={getFileUrl(candidate.signature)}
                                                alt="Signature"
                                                style={{
                                                    maxHeight: '55px',
                                                    maxWidth: '100%',
                                                    objectFit: 'contain',
                                                    display: 'block',
                                                    position: 'relative'
                                                }}
                                                onLoad={async (e) => {
                                                    const dataUrl = await fetchImageAsDataUrl(candidate.signature);
                                                    if (dataUrl) {
                                                        e.target.src = dataUrl;
                                                    }
                                                }}
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                }}
                                            />
                                        ) : (
                                            <span>&nbsp;</span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <span>Passport Size Photo</span>
                                    <div className="border-b border-black mt-0.5 min-h-[60px] pb-1 flex items-center justify-center" style={{ position: 'relative', overflow: 'hidden' }}>
                                        {candidate.passport_size_photo && imageCache[candidate.passport_size_photo] ? (
                                            <img
                                                src={imageCache[candidate.passport_size_photo]}
                                                alt="Passport Photo"
                                                style={{
                                                    width: '45px',
                                                    height: '55px',
                                                    objectFit: 'cover',
                                                    objectPosition: 'center',
                                                    display: 'block',
                                                    position: 'absolute',
                                                    left: '50%',
                                                    transform: 'translateX(-50%)'
                                                }}
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                }}
                                            />
                                        ) : candidate.passport_size_photo ? (
                                            <img
                                                src={getFileUrl(candidate.passport_size_photo)}
                                                alt="Passport Photo"
                                                style={{
                                                    width: '45px',
                                                    height: '55px',
                                                    objectFit: 'cover',
                                                    objectPosition: 'center',
                                                    display: 'block',
                                                    position: 'absolute',
                                                    left: '50%',
                                                    transform: 'translateX(-50%)'
                                                }}
                                                onLoad={async (e) => {
                                                    const dataUrl = await fetchImageAsDataUrl(candidate.passport_size_photo);
                                                    if (dataUrl) {
                                                        e.target.src = dataUrl;
                                                    }
                                                }}
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                }}
                                            />
                                        ) : (
                                            <span>&nbsp;</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="page-break"></div>
                        <div className="mb-2">
                            <div className="mb-1">
                                <span>Date</span>
                                <div className="border-b border-black mt-0.5 min-h-[18px] inline-block w-full pb-1">
                                    {date}
                                </div>
                            </div>
                            <div className="mb-1">
                                <span>Employee Printed Name</span>
                                <div className="border-b border-black mt-0.5 min-h-[18px] inline-block w-full pb-1">
                                    {employeeName}
                                </div>
                            </div>
                            <div className="mb-1">
                                <span>Employer Signature</span>
                                <div className="border-b border-black mt-0.5 min-h-[18px] inline-block w-full pb-1" style={{ position: 'relative', overflow: 'hidden' }}>
                                {candidate.signature && imageCache[candidate.signature] ? (
                                            <img
                                                src={imageCache[candidate.signature]}
                                                alt="Signature"
                                                style={{
                                                    maxHeight: '55px',
                                                    maxWidth: '100%',
                                                    objectFit: 'contain',
                                                    display: 'block',
                                                    position: 'relative'
                                                }}
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                }}
                                            />
                                        ) : candidate.signature ? (
                                            <img
                                                src={getFileUrl(candidate.signature)}
                                                alt="Signature"
                                                style={{
                                                    maxHeight: '55px',
                                                    maxWidth: '100%',
                                                    objectFit: 'contain',
                                                    display: 'block',
                                                    position: 'relative'
                                                }}
                                                onLoad={async (e) => {
                                                    const dataUrl = await fetchImageAsDataUrl(candidate.signature);
                                                    if (dataUrl) {
                                                        e.target.src = dataUrl;
                                                    }
                                                }}
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                }}
                                            />
                                        ) : (
                                            <span>&nbsp;</span>
                                        )}
                                </div>
                            </div>
                        </div>
                        <div className="mt-2">
                            <h3 className="uppercase font-semibold mb-1.5 text-[13px]">Rules & Regulations:</h3>
                            <div className="mb-0.5">
                                <span className="inline-block w-6">1.</span>
                                <span className="ml-2">Employees must be at least 18 years old.</span>
                            </div>
                            <div className="mb-0.5">
                                <span className="inline-block w-6">2.</span>
                                <span className="ml-2">Deliver exceptional spa services including massages, facials, and wellness therapies.</span>
                            </div>
                            <div className="mb-0.5">
                                <span className="inline-block w-6">3.</span>
                                <span className="ml-2">Maintain spa cleanliness and hygiene at all times.</span>
                            </div>
                            <div className="mb-0.5">
                                <span className="inline-block w-6">4.</span>
                                <span className="ml-2">Understand and address client needs and preferences.</span>
                            </div>
                            <div className="mb-0.5">
                                <span className="inline-block w-6">5.</span>
                                <span className="ml-2">Provide high-quality customer service.</span>
                            </div>
                            <div className="mb-0.5">
                                <span className="inline-block w-6">6.</span>
                                <span className="ml-2">Follow the dress code.</span>
                            </div>
                            <div className="mb-0.5">
                                <span className="inline-block w-6">7.</span>
                                <span className="ml-2">Maintain personal hygiene standards.</span>
                            </div>
                            <div className="mb-0.5">
                                <span className="inline-block w-6">8.</span>
                                <span className="ml-2">Maintain professionalism and confidentiality with clients.</span>
                            </div>
                            <div className="mb-0.5">
                                <span className="inline-block w-6">9.</span>
                                <span className="ml-2">Report safety concerns or policy violations to management.</span>
                            </div>
                            <div className="mb-0.5">
                                <span className="inline-block w-6">10.</span>
                                <span className="ml-2">Only therapeutic spa treatments are allowed. Any form of sexual activity is strictly prohibited.</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="text-center mt-4 print:hidden flex gap-4 justify-center">
                    {onDownload && (
                        <button
                            onClick={handleDownload}
                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Download PDF
                        </button>
                    )}
                    <button
                        onClick={handlePrint}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                        Print
                    </button>
                </div>
            </div>
        </>
    );
};

export default PrintUdertakingDetails;

