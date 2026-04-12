import React, { useRef } from "react";
import { getFileUrl } from "../../../../utils/fileUtils";
const PrintUdertakingDetails = ({ data = {}, onDownload }) => {
    const candidate = data.candidate || data;
    const printRef = useRef(null);

    const employeeName = `${candidate.first_name || ""} ${candidate.middle_name || ""} ${candidate.last_name || ""}`.trim();
    const designation = candidate.position_applied_for || "";
    const companyName = candidate.spa?.name || candidate.spa_name_text || "";
    const date = candidate.created_at ? new Date(candidate.created_at).toLocaleDateString() : new Date().toLocaleDateString();
    const ageProof = candidate.age_proof_document ? "AadharCard" : "";


    const handleDownload = () => {
        if (onDownload && printRef.current) {
            onDownload(printRef.current);
        }
    };


    return (
        <>
            <style>{`
                @media print {
                    @page {
                        size: A4;
                        margin: 10mm 15mm;
                    }
                    body {
                        margin: 0;
                        padding: 0;
                    }
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        color-adjust: exact !important;
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                    }
                    .a4-page {
                        page-break-after: avoid !important;
                        break-after: avoid !important;
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
                    padding: 10mm 15mm;
                    margin: 0 auto;
                    background: white;
                    box-sizing: border-box;
                    display: flex;
                    flex-direction: column;
                }
                @media screen {
                    .a4-page {
                        box-shadow: 0 0 10px rgba(0,0,0,0.1);
                    }
                }
                .a4-page img {
                    display: block;
                }
                .form-content {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }
            `}</style>
            <div className="print-container">
                <div ref={printRef} className="a4-page text-[11px] leading-snug font-[Times_New_Roman]">
                    <div className="form-content">
                        <h2 className="text-center  font-bold text-sm mb-2 mt-0" style={{ fontSize: '14px', marginBottom: '6px' }}>
                            Undertaking Form
                        </h2>
                        <div className="mb-1.5" style={{ marginBottom: '4px' }}>
                            <p className="text-justify leading-tight text-[10px]" style={{ fontSize: '10px', lineHeight: '1.3' }}>
                                I, <strong>{employeeName}</strong>, employee working as <strong>{designation}</strong> at{" "}
                                <strong>{companyName}</strong>, hereby undertake as follows:
                            </p>
                        </div>
                        <div className="mb-1.5" style={{ marginBottom: '4px' }}>
                            <h3 className="font-semibold mb-1 text-[11px]" style={{ marginBottom: '3px', fontSize: '11px' }}>UNDERTAKING:</h3>
                            <div className="mb-0.5" style={{ marginBottom: '1px' }}>
                                <span className="inline-block w-5 text-[10px]">1.</span>
                                <span className="ml-1 text-[10px]">I will faithfully and diligently perform the duties assigned to me.</span>
                            </div>
                            <div className="mb-0.5" style={{ marginBottom: '1px' }}>
                                <span className="inline-block w-5 text-[10px]">2.</span>
                                <span className="ml-1 text-[10px]">I hereby state that I am over 18 years old and have submitted a government-approved age-proof document.</span>
                            </div>
                            <div className="mb-0.5" style={{ marginBottom: '1px' }}>
                                <span className="inline-block w-5 text-[10px]">3.</span>
                                <span className="ml-1 text-[10px]">I will comply with all company rules, regulations, policies, and procedures.</span>
                            </div>
                            <div className="mb-0.5" style={{ marginBottom: '1px' }}>
                                <span className="inline-block w-5 text-[10px]">4.</span>
                                <span className="ml-1 text-[10px]">I will not engage in any activity that conflicts with the company's interests.</span>
                            </div>
                            <div className="mb-0.5" style={{ marginBottom: '1px' }}>
                                <span className="inline-block w-5 text-[10px]">5.</span>
                                <span className="ml-1 text-[10px]">I will maintain professional conduct and decorum within and outside the workplace.</span>
                            </div>
                            <div className="mb-0.5" style={{ marginBottom: '1px' }}>
                                <span className="inline-block w-5 text-[10px]">6.</span>
                                <span className="ml-1 text-[10px]">I understand that any breach of this undertaking may result in disciplinary action, including termination.</span>
                            </div>
                            <div className="mb-0.5" style={{ marginBottom: '1px' }}>
                                <span className="inline-block w-5 text-[10px]">7.</span>
                                <span className="ml-1 text-[10px]">My signature is given freely without force, fraud, or undue influence.</span>
                            </div>
                        </div>
                        <div className="mb-1.5" style={{ marginBottom: '4px' }}>
                            <h3 className="font-semibold mb-1 text-[11px]" style={{ marginBottom: '3px', fontSize: '11px' }}>DECLARATION:</h3>
                            <p className="text-justify leading-tight text-[9px]" style={{ fontSize: '9px', lineHeight: '1.3' }}>
                                I hereby declare that the information given by me to the employer is true, complete and
                                correct to the best of my knowledge and belief and that nothing has been concealed or
                                distorted. If at any point of time, I am found to have concealed/distorted any information or
                                given any false statement, my appointment shall liable to be summarily
                                rejected/terminated without notice or compensation.
                            </p>
                        </div>
                        <div className="mb-1.5" style={{ marginBottom: '4px' }}>
                            <h3 className="font-semibold mb-1 text-[11px]" style={{ marginBottom: '3px', fontSize: '11px' }}>SIGNATURES:</h3>
                            <div className="mb-1.5 flex gap-3" style={{ marginBottom: '4px' }}>
                                <div className="flex-1">
                                    <span className="text-[10px]">Employee Signature</span>
                                    <div className="border-b border-black mt-0.5 min-h-[40px] pb-0.5 flex items-center" style={{ minHeight: '35px', paddingBottom: '2px' }}>
                                        {candidate.signature ? (
                                            <img
                                                src={getFileUrl(candidate.signature)}
                                                alt="Signature"
                                                crossOrigin="anonymous"
                                                style={{
                                                    maxHeight: '32px',
                                                    maxWidth: '100%',
                                                    objectFit: 'contain',
                                                    display: 'block',
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
                                    <span className="text-[10px]">Passport Size Photo</span>
                                    <div className="border-b border-black mt-0.5 min-h-[40px] pb-0.5 flex items-center justify-center" style={{ minHeight: '35px', paddingBottom: '2px' }}>
                                        {candidate.passport_size_photo ? (
                                            <img
                                                src={getFileUrl(candidate.passport_size_photo)}
                                                alt="Passport Photo"
                                                crossOrigin="anonymous"
                                                style={{
                                                    width: '35px',
                                                    height: '42px',
                                                    objectFit: 'cover',
                                                    objectPosition: 'center',
                                                    display: 'block'
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
                        <div className="mb-1.5" style={{ marginBottom: '4px' }}>
                            <div className="mb-0.5" style={{ marginBottom: '2px' }}>
                                <span className="text-[10px]">Date</span>
                                <div className="border-b border-black mt-0.5 min-h-[14px] inline-block w-full pb-0.5" style={{ minHeight: '12px', paddingBottom: '2px' }}>
                                    {date}
                                </div>
                            </div>
                            <div className="mb-0.5" style={{ marginBottom: '2px' }}>
                                <span className="text-[10px]">Employee Printed Name</span>
                                <div className="border-b border-black mt-0.5 min-h-[14px] inline-block w-full pb-0.5" style={{ minHeight: '12px', paddingBottom: '2px' }}>
                                    {employeeName}
                                </div>
                            </div>
                            <div className="mb-0.5" style={{ marginBottom: '2px' }}>
                                <span className="text-[10px]">Employer Signature</span>
                                <div className="border-b border-black mt-0.5 min-h-[14px] inline-block w-full pb-0.5" style={{ minHeight: '12px', paddingBottom: '2px' }}>
                                    {candidate.signature ? (
                                        <img
                                            src={getFileUrl(candidate.signature)}
                                            alt="Signature"
                                            crossOrigin="anonymous"
                                            style={{
                                                maxHeight: '32px',
                                                maxWidth: '100%',
                                                objectFit: 'contain',
                                                display: 'block',
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
                        <div className="mt-1.5 flex-1" style={{ marginTop: '4px', flex: '1 1 auto' }}>
                            <h3 className=" font-semibold mb-1 text-[11px]" style={{ marginBottom: '3px', fontSize: '11px' }}>Rules & Regulations:</h3>
                            <div className="mb-0.5" style={{ marginBottom: '1px' }}>
                                <span className="inline-block w-5 text-[9px]">1.</span>
                                <span className="ml-1 text-[9px]">Employees must be at least 18 years old.</span>
                            </div>
                            <div className="mb-0.5" style={{ marginBottom: '1px' }}>
                                <span className="inline-block w-5 text-[9px]">2.</span>
                                <span className="ml-1 text-[9px]">Deliver exceptional spa services including massages, facials, and wellness therapies.</span>
                            </div>
                            <div className="mb-0.5" style={{ marginBottom: '1px' }}>
                                <span className="inline-block w-5 text-[9px]">3.</span>
                                <span className="ml-1 text-[9px]">Maintain spa cleanliness and hygiene at all times.</span>
                            </div>
                            <div className="mb-0.5" style={{ marginBottom: '1px' }}>
                                <span className="inline-block w-5 text-[9px]">4.</span>
                                <span className="ml-1 text-[9px]">Understand and address client needs and preferences.</span>
                            </div>
                            <div className="mb-0.5" style={{ marginBottom: '1px' }}>
                                <span className="inline-block w-5 text-[9px]">5.</span>
                                <span className="ml-1 text-[9px]">Provide high-quality customer service.</span>
                            </div>
                            <div className="mb-0.5" style={{ marginBottom: '1px' }}>
                                <span className="inline-block w-5 text-[9px]">6.</span>
                                <span className="ml-1 text-[9px]">Follow the dress code.</span>
                            </div>
                            <div className="mb-0.5" style={{ marginBottom: '1px' }}>
                                <span className="inline-block w-5 text-[9px]">7.</span>
                                <span className="ml-1 text-[9px]">Maintain personal hygiene standards.</span>
                            </div>
                            <div className="mb-0.5" style={{ marginBottom: '1px' }}>
                                <span className="inline-block w-5 text-[9px]">8.</span>
                                <span className="ml-1 text-[9px]">Maintain professionalism and confidentiality with clients.</span>
                            </div>
                            <div className="mb-0.5" style={{ marginBottom: '1px' }}>
                                <span className="inline-block w-5 text-[9px]">9.</span>
                                <span className="ml-1 text-[9px]">Report safety concerns or policy violations to management.</span>
                            </div>
                            <div className="mb-0.5" style={{ marginBottom: '1px' }}>
                                <span className="inline-block w-5 text-[9px]">10.</span>
                                <span className="ml-1 text-[9px]">Only therapeutic spa treatments are allowed. Any form of sexual activity is strictly prohibited.</span>
                            </div>
                        </div>
                    </div>
                </div>
                {onDownload && (
                    <div className="text-center mt-4 print:hidden">
                        <button
                            onClick={handleDownload}
                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 mx-auto transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Download PDF
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

export default PrintUdertakingDetails;

