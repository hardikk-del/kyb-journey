import React from "react";
import { Routes, Route } from "react-router-dom";
import { StartScreen } from "./screens/StartScreen";
import { EntityDetailsScreen } from "./screens/EntityDetailsScreen";
import { ChecklistScreen } from "./screens/ChecklistScreen";
import { LinkSentScreen } from "./screens/LinkSentScreen";
import { IdentityScreen } from "./screens/IdentityScreen";
import { SelfieCaptureScreen } from "./screens/SelfieCaptureScreen";
import { BusinessProofScreen } from "./screens/BusinessProofScreen";
import { SelfDeclarationScreen } from "./screens/SelfDeclarationScreen";
import { BusinessDetailsScreen } from "./screens/BusinessDetailsScreen";
import { SiteVerificationScreen } from "./screens/SiteVerificationScreen";
import { AccountSetupScreen } from "./screens/AccountSetupScreen";
import { SignatureNomineeScreen } from "./screens/SignatureNomineeScreen";
import { AofEsignScreen } from "./screens/AofEsignScreen";
import { SubmittedScreen } from "./screens/SubmittedScreen";
import { ReviewScreen } from "./screens/ReviewScreen";
import { PartnerContactsScreen } from "./screens/PartnerContactsScreen";
import { PartnerTrackingScreen } from "./screens/PartnerTrackingScreen";
import { DirectorKycScreen } from "./screens/DirectorKycScreen";
import { ShareholdingScreen } from "./screens/ShareholdingScreen";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/partner-contacts" element={<PartnerContactsScreen />} />
      <Route path="/partner-tracking" element={<PartnerTrackingScreen />} />
      <Route path="/director-kyc" element={<DirectorKycScreen />} />
      <Route path="/shareholding" element={<ShareholdingScreen />} />
      <Route path="/" element={<StartScreen />} />
      <Route path="/entity-details" element={<EntityDetailsScreen />} />
      <Route path="/checklist" element={<ChecklistScreen />} />
      {/* Link branch */}
      <Route path="/link-sent" element={<LinkSentScreen />} />
      <Route path="/review" element={<ReviewScreen />} />
      {/* Manual branch: Identity → Selfie → Business documents.
          Identity's CTA points at "/business-proof", so the selfie capture step
          renders there, and the business-documents screen lives at "/business-docs". */}
      <Route path="/identity" element={<IdentityScreen />} />
      <Route path="/business-proof" element={<SelfieCaptureScreen />} />
      <Route path="/business-docs" element={<BusinessProofScreen />} />
      <Route path="/self-declaration" element={<SelfDeclarationScreen />} />
      <Route path="/business-details" element={<BusinessDetailsScreen />} />
      <Route path="/site-verification" element={<SiteVerificationScreen />} />
      <Route path="/account-setup" element={<AccountSetupScreen />} />
      <Route path="/signature-nominee" element={<SignatureNomineeScreen />} />
      <Route path="/aof-esign" element={<AofEsignScreen />} />
      <Route path="/submitted" element={<SubmittedScreen />} />
    </Routes>
  );
}
