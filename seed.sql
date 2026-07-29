-- Replace the complete certificate registry with the approved July 2026 set.
-- The verification code for every record is its laboratory task number.
DELETE FROM certificates;

INSERT INTO certificates
(serial_number, product_name, strength, task_number, batch_number, analysis_date, measured_result, purity, certificate_url, status)
VALUES
('172950', 'AOD-9604', '10 mg', '172950', 'white', '17 June 2026', 'AOD-9604: 9.77 mg; 9.56 mg', '99.160%; 99.102%', '/assets/certificates-new/aod-9604-172950.png', 'active'),
('123419', 'BPC-157 + TB-500', '10 mg (5 mg + 5 mg)', '123419', '2026/03', '24 March 2026', 'BPC-157: 5.32 mg; TB-500: 5.24 mg', 'Not reported', '/assets/certificates-new/bpc-tb-123419.png', 'active'),
('121834', 'CJC-1295 + Ipamorelin', '10 mg (5 mg + 5 mg)', '121834', 'Not stated on certificate', '17 March 2026', 'CJC-1295: 7.27 mg; Ipamorelin: 5.97 mg', 'Not reported', '/assets/certificates-new/cjc-ipa-121834.png', 'active'),
('157282', 'GHK-Cu', '100 mg', '157282', 'GHK-02272026-3', '8 June 2026', 'GHK-Cu: 96.90 mg (GHK content: 80.80 mg; copper content: 16.10 mg)', '99.415%', '/assets/certificates-new/ghk-cu-157282.png', 'active'),
('136730', 'GLOW', '70 mg', '136730', 'Not stated on certificate', '21 April 2026', 'GHK-Cu: 45.17 mg; BPC-157: 11.95 mg; TB-500: 11.55 mg', 'Not reported', '/assets/certificates-new/glow-136730.png', 'active'),
('87708', 'KLOW', '80 mg', '87708', '2025-11', '13 November 2025', 'GHK-Cu: 71.36 mg; BPC-157: 12.41 mg; TB-500: 11.12 mg; KPV: 11.75 mg', 'Not reported', '/assets/certificates-new/klow-87708.png', 'active'),
('121832', 'NAD+', '500 mg', '121832', 'Not stated on certificate', '18 March 2026', 'NAD+: 536.16 mg', 'Not reported', '/assets/certificates-new/nad-121832.png', 'active'),
('147108', 'PT-141', '10 mg', '147108', '24 February 2026', '14 April 2026', 'PT-141: 11.43 mg', '99.901%', '/assets/certificates-new/pt141-147108.png', 'active'),
('155862', 'Retatrutide', '10 mg', '155862', 'RT10/2026-04-06A', '7 May 2026', 'Retatrutide: 10.47 mg; 10.86 mg', '99.331%; 99.502%', '/assets/certificates-new/retatrutide-10mg-155862.png', 'active'),
('173868', 'Retatrutide', '30 mg', '173868', 'Unknown', '10 July 2026', 'Retatrutide: 31.53 mg', '99.685%', '/assets/certificates-new/retatrutide-30mg-173868.png', 'active'),
('155079', 'Semaglutide', 'Not stated on certificate', '155079', 'S54261', '18 May 2026', 'Semaglutide: 5.76 mg', '99.458%', '/assets/certificates-new/semaglutide-155079.png', 'active'),
('87710', 'Tesamorelin', '10 mg', '87710', '2025-11', '13 November 2025', 'Tesamorelin: 10.38 mg', '99.043%', '/assets/certificates-new/tesamorelin-87710.png', 'active');
