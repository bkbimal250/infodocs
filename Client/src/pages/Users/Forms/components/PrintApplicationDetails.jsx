import React, { useRef } from "react";
import { getFileUrl } from "../../../../utils/fileUtils";

const PrintApplicationDetails = ({ data = {}, onDownload }) => {
  const candidate = data.candidate || data;
  const printRef = useRef(null);

  const spaName = candidate.spa?.name || candidate.spa_name_text || "";
  const firstName = candidate.first_name || "";
  const middleName = candidate.middle_name || "";
  const lastName = candidate.last_name || "";
  const address = candidate.current_address || "";
  const cityStateZip = `${candidate.city || ""}, ${candidate.state || ""} ${candidate.zip_code || ""}`.trim();
  const phoneNumber = candidate.phone_number || "";
  const alternateNumber = candidate.alternate_number || "";
  const age = candidate.age || "";
  const ageProof = candidate.age_proof_document ? "Submitted" : "";
  const position = candidate.position_applied_for || "";
  const education = candidate.education_certificate_courses || "";
  const submissionDate = candidate.created_at
    ? new Date(candidate.created_at).toLocaleDateString()
    : "";

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
            margin: 15mm 20mm;
          }
          body {
            margin: 0;
            padding: 0;
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
      `}</style>

      <div className="print-container">
        <div
          ref={printRef}
          className="a4-page text-[13px] leading-tight font-[Times_New_Roman]"
        >
          {/* HEADER */}
          <h2 className="text-center  font-bold text-lg mb-3 mt-0">
            Job Application Form
          </h2>

          {/* SPA NAME */}
          <div className="mb-2">
            <span className="font-semibold">SPA NAME:</span>
            <div className="border-b border-black mt-0.5 min-h-[18px] pb-1">
              {spaName}
            </div>
          </div>

          {/* PERSONAL INFO */}
          <div className="mb-2">
            <h3 className="font-semibold mb-1.5 text-[13px]">
              PERSONAL INFORMATION:
            </h3>

            {/* NAME IN ONE ROW */}
            <div className="mb-1">
              <span>Name</span>
              <div className="flex gap-3 mt-0.5">
                <div className="flex-1">
                  <div className="text-[11px]">First</div>
                  <div className="border-b border-black min-h-[18px] pb-1">
                    {firstName}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-[11px]">Middle</div>
                  <div className="border-b border-black min-h-[18px] pb-1">
                    {middleName}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-[11px]">Last</div>
                  <div className="border-b border-black min-h-[18px] pb-1">
                    {lastName}
                  </div>
                </div>
              </div>
            </div>

            {/* ADDRESS */}
            <div className="mb-1">
              <span>Address</span>
              <div className="border-b border-black mt-0.5 min-h-[18px] pb-1">
                {address}
              </div>
            </div>

            {/* CITY */}
            <div className="mb-1">
              <span>City, State, Zip Code</span>
              <div className="border-b border-black mt-0.5 min-h-[18px] pb-1">
                {cityStateZip}
              </div>
            </div>

            {/* PHONE */}
            <div className="mb-1">
              <span>Phone Number / Alternate</span>
              <div className="border-b border-black mt-0.5 min-h-[18px] pb-1">
                {phoneNumber}{" "}
                {alternateNumber && ` / ${alternateNumber}`}
              </div>
            </div>

            {/* AGE */}
            <div className="mb-1 flex gap-4">
              <div className="flex-1">
                <span>AGE</span>
                <div className="border-b border-black mt-0.5 min-h-[18px] pb-1">
                  {age}
                </div>
              </div>
              <div className="flex-1">
                <span>AGE PROOF DOCUMENT</span>
                <div className="border-b border-black mt-0.5 min-h-[18px] pb-1">
                  {ageProof}
                </div>
              </div>
            </div>
          </div>

          {/* POSITION */}
          <div className="mb-2">
            <h3 className="font-semibold mb-1.5 text-[13px]">
              POSITION / AVAILABILITY:
            </h3>
            <div className="mb-1">
              <span>Position Applied For</span>
              <div className="border-b border-black mt-0.5 min-h-[18px] pb-1">
                {position}
              </div>
            </div>
          </div>

          {/* EDUCATION */}
          <div className="mb-2">
            <h3 className="font-semibold mb-1.5 text-[13px]">
              EDUCATION / CERTIFIED COURSE:
            </h3>
            <div className="mb-1">
              <span className="font-semibold">
                Skills and Qualifications
              </span>
            </div>
            <div className="border-b border-black min-h-[35px] pb-1">
              {education}
            </div>
          </div>

          {/* DECLARATION */}
          <div className="mb-2">
            <p className="text-[12px] text-justify">
              I certify that information contained in this application is true
              and complete. I understand that false information may be grounds
              for not hiring me or for immediate termination of employment at
              any point in the future if I am hired.
            </p>
          </div>

          {/* SIGNATURE */}
          <div className="mt-3 flex gap-8">
            <div className="flex-1">
              <span>Signature</span>
              <div className="border-b border-black mt-0.5 min-h-[40px] flex items-center">
                {candidate.signature ? (
                  <img
                    src={getFileUrl(candidate.signature)}
                    alt="Signature"
                    className="max-h-[35px]"
                  />
                ) : null}
              </div>
            </div>

            <div className="flex-1">
              <span>Date</span>
              <div className="border-b border-black mt-0.5 min-h-[18px]">
                {submissionDate}
              </div>
            </div>
          </div>
        </div>

        {/* DOWNLOAD BUTTON */}
        {onDownload && (
          <div className="text-center mt-4 print:hidden">
            <button
              onClick={handleDownload}
              className="px-6 py-2 bg-green-600 text-white rounded-lg"
            >
              Download PDF
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default PrintApplicationDetails;