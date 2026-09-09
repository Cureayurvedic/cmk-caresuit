const fs = require('fs');
const path = require('path');

const userList1 = [
  {
    "serviceName": "A.O COMPRESSION PROCEDURES FOR FRACTURE NECK FEMUR  (ICICI) Procedure (103599)",
    "serviceCode": "103599",
    "value": "103599##P##0##0"
  },
  {
    "serviceName": "A.O.Compression Procedures for Fracture Neck Femur(CGHS) (103600)",
    "serviceCode": "103600",
    "value": "103600##P##0##0"
  },
  {
    "serviceName": "Above Elbow Full Plaster (103601)",
    "serviceCode": "103601",
    "value": "103601##P##0##0"
  },
  {
    "serviceName": "Above Elbow Plaster (103602)",
    "serviceCode": "103602",
    "value": "103602##P##0##0"
  },
  {
    "serviceName": "Above Elbow Plaster Application (104840)",
    "serviceCode": "104840",
    "value": "104840##P##0##0"
  },
  {
    "serviceName": "ABOVE ELBOW PLASTER IMPORTED (104892)",
    "serviceCode": "104892",
    "value": "104892##P##0##0"
  },
  {
    "serviceName": "ABOVE ELBOW PLASTER LITE WEIGHTED (104893)",
    "serviceCode": "104893",
    "value": "104893##P##0##0"
  },
  {
    "serviceName": "ABOVE ELBOW PLASTER WATER PROOF (104894)",
    "serviceCode": "104894",
    "value": "104894##P##0##0"
  },
  {
    "serviceName": "Above elbow slab plaster (104841)",
    "serviceCode": "104841",
    "value": "104841##P##0##0"
  },
  {
    "serviceName": "Above Knee / Elbow Pop Slab /Cast (103603)",
    "serviceCode": "103603",
    "value": "103603##P##0##0"
  },
  {
    "serviceName": "Above Knee Full Plaster (103604)",
    "serviceCode": "103604",
    "value": "103604##P##0##0"
  },
  {
    "serviceName": "Above Knee Full Slab(Cghs) (104219)",
    "serviceCode": "104219",
    "value": "104219##P##0##0"
  },
  {
    "serviceName": "ABOVE KNEE PLASTER IMPORTED (104898)",
    "serviceCode": "104898",
    "value": "104898##P##0##0"
  },
  {
    "serviceName": "ABOVE KNEE PLASTER LITE WEIGHT (104899)",
    "serviceCode": "104899",
    "value": "104899##P##0##0"
  },
  {
    "serviceName": "ABOVE KNEE PLASTER WATER PROOF (104900)",
    "serviceCode": "104900",
    "value": "104900##P##0##0"
  },
  {
    "serviceName": "Above Knee Post-Slab(Cghs) (104220)",
    "serviceCode": "104220",
    "value": "104220##P##0##0"
  },
  {
    "serviceName": "ACETABULAR FRACTURE - POSTERIOR WALL / COLUMN ORIF (INCLUDING IMPLANT) (Gipsa)(Procedure) (104221)",
    "serviceCode": "104221",
    "value": "104221##P##0##0"
  },
  {
    "serviceName": "Acetabular Fracture -Anterior Wall (Procedore) (104222)",
    "serviceCode": "104222",
    "value": "104222##P##0##0"
  },
  {
    "serviceName": "Acetabular Fracture- Psteerior Wall/ Coloumn Orif (Including Implants) (Procedure) (104223)",
    "serviceCode": "104223",
    "value": "104223##P##0##0"
  },
  {
    "serviceName": "Acetabular Fracture-Anterior Wall / Column ORIF (Including Implant) (Procedure) (Gipsa) (104224)",
    "serviceCode": "104224",
    "value": "104224##P##0##0"
  },
  {
    "serviceName": "ACL & PCL RECONSTRCUTION / REPAIR (PROCEDURE) (Gipsa) (104213)",
    "serviceCode": "104213",
    "value": "104213##P##0##0"
  },
  {
    "serviceName": "ACL & PCL Reconstruction/ Repair (Procedure) (104214)",
    "serviceCode": "104214",
    "value": "104214##P##0##0"
  },
  {
    "serviceName": "Acl / Pcl Avulsion - Fixator (Arthroscopic Open) (104215)",
    "serviceCode": "104215",
    "value": "104215##P##0##0"
  },
  {
    "serviceName": "ACL RECONSTRUCTION  (ICICI) Procedure (104216)",
    "serviceCode": "104216",
    "value": "104216##P##0##0"
  },
  {
    "serviceName": "ACL Reconstruction (Haryana Govt) Procedure (104217)",
    "serviceCode": "104217",
    "value": "104217##P##0##0"
  },
  {
    "serviceName": "ACL RECONSTRUCTION / REPAIR (PROCEDURE) (Gipsa) (104218)",
    "serviceCode": "104218",
    "value": "104218##P##0##0"
  },
  {
    "serviceName": "ACL Reconstruction(CGHS) (104207)",
    "serviceCode": "104207",
    "value": "104207##P##0##0"
  },
  {
    "serviceName": "ACL Reconstruction/ Repair (Procedure) (104208)",
    "serviceCode": "104208",
    "value": "104208##P##0##0"
  },
  {
    "serviceName": "ACL REPAIR  (ICICI) Procedure (104209)",
    "serviceCode": "104209",
    "value": "104209##P##0##0"
  },
  {
    "serviceName": "ACL REPAIR WITH MENISCECTOMY  (Bajaj Allianz) Procedure (104210)",
    "serviceCode": "104210",
    "value": "104210##P##0##0"
  },
  {
    "serviceName": "ACL/PCL/REPAIR  (Bajaj Allianz) Procedure (104211)",
    "serviceCode": "104211",
    "value": "104211##P##0##0"
  },
  {
    "serviceName": "Acromioplasty-Sub Acromial Decompression & Excision Of Lateral End Of Clavicle (104212)",
    "serviceCode": "104212",
    "value": "104212##P##0##0"
  },
  {
    "serviceName": "Adductor Tenotomy & Obturator Neurectomy (104201)",
    "serviceCode": "104201",
    "value": "104201##P##0##0"
  },
  {
    "serviceName": "ADENOTOSILLECTOMY (PROCEDURE) (Gipsa) (104202)",
    "serviceCode": "104202",
    "value": "104202##P##0##0"
  },
  {
    "serviceName": "Adhesiolysis / Moblization Of Joint (104203)",
    "serviceCode": "104203",
    "value": "104203##P##0##0"
  },
  {
    "serviceName": "All Open Reduction With Internal Fixation With Bone Grafting (104204)",
    "serviceCode": "104204",
    "value": "104204##P##0##0"
  },
  {
    "serviceName": "Amputation above Elbow (Haryana Govt) Procedure (104205)",
    "serviceCode": "104205",
    "value": "104205##P##0##0"
  },
  {
    "serviceName": "Amputation above Knee (Haryana Govt) Procedure (104206)",
    "serviceCode": "104206",
    "value": "104206##P##0##0"
  },
  {
    "serviceName": "Amputation below Elbow (Haryana Govt) Procedure (104195)",
    "serviceCode": "104195",
    "value": "104195##P##0##0"
  },
  {
    "serviceName": "Amputation below Knee (Haryana Govt) Procedure (104196)",
    "serviceCode": "104196",
    "value": "104196##P##0##0"
  },
  {
    "serviceName": "Amputation Of Digits-Multiple (104197)",
    "serviceCode": "104197",
    "value": "104197##P##0##0"
  },
  {
    "serviceName": "Amputation Of Digits-Single (104198)",
    "serviceCode": "104198",
    "value": "104198##P##0##0"
  },
  {
    "serviceName": "Amputation- Fore Quarter (104199)",
    "serviceCode": "104199",
    "value": "104199##P##0##0"
  },
  {
    "serviceName": "Amputation- Fore/Hind Quarter(Procedure) (104200)",
    "serviceCode": "104200",
    "value": "104200##P##0##0"
  },
  {
    "serviceName": "Amputation- Hind Quarter (104189)",
    "serviceCode": "104189",
    "value": "104189##P##0##0"
  },
  {
    "serviceName": "Amputation-Ae (104190)",
    "serviceCode": "104190",
    "value": "104190##P##0##0"
  },
  {
    "serviceName": "Amputation-Ak (104191)",
    "serviceCode": "104191",
    "value": "104191##P##0##0"
  },
  {
    "serviceName": "Amputation-Be (104192)",
    "serviceCode": "104192",
    "value": "104192##P##0##0"
  },
  {
    "serviceName": "Amputation-Bk (104193)",
    "serviceCode": "104193",
    "value": "104193##P##0##0"
  },
  {
    "serviceName": "Amputations -   Below Knee(CGHS) (104194)",
    "serviceCode": "104194",
    "value": "104194##P##0##0"
  },
  {
    "serviceName": "Amputations -  Above Elbow(CGHS) (104183)",
    "serviceCode": "104183",
    "value": "104183##P##0##0"
  },
  {
    "serviceName": "Amputations -  Above Knee(CGHS) (104184)",
    "serviceCode": "104184",
    "value": "104184##P##0##0"
  },
  {
    "serviceName": "Amputations -  Below Elbow(CGHS) (104185)",
    "serviceCode": "104185",
    "value": "104185##P##0##0"
  },
  {
    "serviceName": "Amputations -  Forequarter(CGHS) (104186)",
    "serviceCode": "104186",
    "value": "104186##P##0##0"
  },
  {
    "serviceName": "Amputations -Hind Quarter and Hemipelvectomy(CGHS) (104187)",
    "serviceCode": "104187",
    "value": "104187##P##0##0"
  },
  {
    "serviceName": "AMPUTION/DISARTICULATION MAJOR  (ICICI) Procedure (104188)",
    "serviceCode": "104188",
    "value": "104188##P##0##0"
  },
  {
    "serviceName": "AMPUTION/DISARTICULATION MINOR  (ICICI) Procedure (104177)",
    "serviceCode": "104177",
    "value": "104177##P##0##0"
  },
  {
    "serviceName": "Ankle/ Tibia Fracture- Orif/ Crif with Screws/ TPW- Excluding Implant (Procedure) (104178)",
    "serviceCode": "104178",
    "value": "104178##P##0##0"
  },
  {
    "serviceName": "ANKLE/TIBIA FRACTURE -ORIF /ORIF WITH SCREWS/ TPW EXCLUDING  IMPLANT (PROC) (Gipsa) (104179)",
    "serviceCode": "104179",
    "value": "104179##P##0##0"
  },
  {
    "serviceName": "Antereolateral Decompression and Spil Fusion(CGHS) (104180)",
    "serviceCode": "104180",
    "value": "104180##P##0##0"
  },
  {
    "serviceName": "Anterior Cervical Fusion (104181)",
    "serviceCode": "104181",
    "value": "104181##P##0##0"
  },
  {
    "serviceName": "Anterior Spinal Fusion & Decompression At Multiple Levels (104182)",
    "serviceCode": "104182",
    "value": "104182##P##0##0"
  },
  {
    "serviceName": "Anterior Spinal Fusion With Decompression At Single Level (104171)",
    "serviceCode": "104171",
    "value": "104171##P##0##0"
  },
  {
    "serviceName": "ANTEROLATERAL DECOMPRESION & SPINAL FUSION  (ICICI) Procedure (104172)",
    "serviceCode": "104172",
    "value": "104172##P##0##0"
  },
  {
    "serviceName": "Anterolateral decompression for tuberculosis/ Costo- Transversectomy(CGHS) (104173)",
    "serviceCode": "104173",
    "value": "104173##P##0##0"
  },
  {
    "serviceName": "Application For Ctev Per Sitting(Cghs) (104174)",
    "serviceCode": "104174",
    "value": "104174##P##0##0"
  },
  {
    "serviceName": "Application Of Functiol Cast Brace(Cghs) (104175)",
    "serviceCode": "104175",
    "value": "104175##P##0##0"
  },
  {
    "serviceName": "Application Of P. O. P. Casts For Upper & Lower Limbs (104176)",
    "serviceCode": "104176",
    "value": "104176##P##0##0"
  },
  {
    "serviceName": "Application Of P.O.P Casts For Upper & Lower Limbs(Cghs) (104165)",
    "serviceCode": "104165",
    "value": "104165##P##0##0"
  },
  {
    "serviceName": "Application Of P.O.P Spices & Jackets(Cghs) (104166)",
    "serviceCode": "104166",
    "value": "104166##P##0##0"
  },
  {
    "serviceName": "Application Of Skeletal Tractions(Cghs) (104167)",
    "serviceCode": "104167",
    "value": "104167##P##0##0"
  },
  {
    "serviceName": "Application Of Skin Traction(Cghs) (104168)",
    "serviceCode": "104168",
    "value": "104168##P##0##0"
  },
  {
    "serviceName": "ARTHORSCOPY KNEE-OPERATIVE  (ICICI) Procedure (104169)",
    "serviceCode": "104169",
    "value": "104169##P##0##0"
  },
  {
    "serviceName": "Arthoscopic Bankart Repair (104170)",
    "serviceCode": "104170",
    "value": "104170##P##0##0"
  },
  {
    "serviceName": "ARTHRODESIS - WRIST/ ANKLE SUBTALAR (EXCLUDING IMPLANT) (PROCEDURE) (Gipsa) (104159)",
    "serviceCode": "104159",
    "value": "104159##P##0##0"
  },
  {
    "serviceName": "Arthrodesis of -   Major Joints(CGHS) (104160)",
    "serviceCode": "104160",
    "value": "104160##P##0##0"
  },
  {
    "serviceName": "Arthrodesis of -   Minor Joints(CGHS) (104161)",
    "serviceCode": "104161",
    "value": "104161##P##0##0"
  },
  {
    "serviceName": "Arthrodesis Of Large Joints(Procedure) (104162)",
    "serviceCode": "104162",
    "value": "104162##P##0##0"
  },
  {
    "serviceName": "Arthrodesis Of Major Joints - Foot (104163)",
    "serviceCode": "104163",
    "value": "104163##P##0##0"
  },
  {
    "serviceName": "Arthrodesis Of Major Joints - Hand (104164)",
    "serviceCode": "104164",
    "value": "104164##P##0##0"
  }
];

const userList2 = [
  {"text":"Arthrodesis Of Major Joints - Shoulder (104153)","value":"104153##P##0##0","RefServiceCode":""},
  {"text":"Arthrodesis Of Major Joints -Pan Talar (104154)","value":"104154##P##0##0","RefServiceCode":""},
  {"text":"Arthrodesis Of Major Joints- Elbow (104155)","value":"104155##P##0##0","RefServiceCode":""},
  {"text":"Arthrodesis Of Major Joints- Hip (104156)","value":"104156##P##0##0","RefServiceCode":""},
  {"text":"Arthrodesis Of Major Joints-Knee (104157)","value":"104157##P##0##0","RefServiceCode":""},
  {"text":"Arthrodesis Of Medium Joints(Procedure) (104158)","value":"104158##P##0##0","RefServiceCode":""},
  {"text":"Arthrodesis Of Small Joints(Procedure) (104147)","value":"104147##P##0##0","RefServiceCode":""},
  {"text":"Arthrodesis- Wrist/ Ankle Subtalar- (Excluding Implant) (Procedure) (104148)","value":"104148##P##0##0","RefServiceCode":""},
  {"text":"Arthrography(CGHS) (104149)","value":"104149##P##0##0","RefServiceCode":""},
  {"text":"Arthrolysis of knee(CGHS) (104150)","value":"104150##P##0##0","RefServiceCode":""},
  {"text":"Arthroscopic Acl Reconstruction (104151)","value":"104151##P##0##0","RefServiceCode":""},
  {"text":"Arthroscopic Assisted Tibial Spine Fracture Reduction & Fixation (104152)","value":"104152##P##0##0","RefServiceCode":""},
  {"text":"Arthroscopic Decompr Tendon Repair Of Shoulder(Ession) (104141)","value":"104141##P##0##0","RefServiceCode":""},
  {"text":"Arthroscopic Joint Debridement (104142)","value":"104142##P##0##0","RefServiceCode":""},
  {"text":"Arthroscopic Meniscal Repair (104143)","value":"104143##P##0##0","RefServiceCode":""},
  {"text":"Arthroscopic Menisectomy (104144)","value":"104144##P##0##0","RefServiceCode":""},
  {"text":"Arthroscopic Pcl Reconstruction (104145)","value":"104145##P##0##0","RefServiceCode":""},
  {"text":"Arthroscopic Surgery (Procedure) (104146)","value":"104146##P##0##0","RefServiceCode":""},
  {"text":"ARTHROSCOPIC SURGERY (PROCEDURE) (Gipsa) (104135)","value":"104135##P##0##0","RefServiceCode":""},
  {"text":"Arthroscopic Synovectomy Hip (104136)","value":"104136##P##0##0","RefServiceCode":""},
  {"text":"Arthroscopic Synovectomy Knee (104137)","value":"104137##P##0##0","RefServiceCode":""},
  {"text":"Arthroscopic Synovectomy Shoulder (104138)","value":"104138##P##0##0","RefServiceCode":""},
  {"text":"Arthroscopic Synovectomy Wrist (104139)","value":"104139##P##0##0","RefServiceCode":""},
  {"text":"Arthroscopy - Diagnostic(CGHS) (104140)","value":"104140##P##0##0","RefServiceCode":""},
  {"text":"Arthroscopy - Acl Repair - (ESIC-40) (104129)","value":"104129##P##0##0","RefServiceCode":""},
  {"text":"Arthroscopy . Operative Meniscectomy - (ESIC-39) (104130)","value":"104130##P##0##0","RefServiceCode":""},
  {"text":"ARTHROSCOPY-DIAGNOSTIC (Bajaj Allianz) Procedure (104131)","value":"104131##P##0##0","RefServiceCode":""},
  {"text":"ARTHROSCOPY-DIAGNOSTIC (ICICI) Procedure (104132)","value":"104132##P##0##0","RefServiceCode":""},
  {"text":"ARTHROSCOPY-OPERATIVE (Bajaj Allianz) Procedure (104133)","value":"104133##P##0##0","RefServiceCode":""},
  {"text":"ARTHROSCOPY-OPERATIVE Proc(Bajaj Allianz) (104134)","value":"104134##P##0##0","RefServiceCode":""},
  {"text":"Arthroscopy-therapeutic: with implant(CGHS) (104123)","value":"104123##P##0##0","RefServiceCode":""},
  {"text":"Arthroscopy-therapeutic: without implant(CGHS) (104124)","value":"104124##P##0##0","RefServiceCode":""},
  {"text":"ARTHROTOMY (ICICI) Procedure (104125)","value":"104125##P##0##0","RefServiceCode":""},
  {"text":"Arthrotomy Ankle /Knee /Hip /Shoulder (104126)","value":"104126##P##0##0","RefServiceCode":""},
  {"text":"Arthrotomy Knee (104127)","value":"104127##P##0##0","RefServiceCode":""},
  {"text":"Arthrotomy Wrist (104128)","value":"104128##P##0##0","RefServiceCode":""},
  {"text":"Aspiration & Intra Articular Injections (104117)","value":"104117##P##0##0","RefServiceCode":""},
  {"text":"Aspiration Knee With Debridement With A/K Pop Slab (104118)","value":"104118##P##0##0","RefServiceCode":""},
  {"text":"AV FISTULA (PROCEDURE) (Gipsa) (104119)","value":"104119##P##0##0","RefServiceCode":""},
  {"text":"Avascular Necrosis Of Femoral Head (Core Decompression - (ESIC-41) (104120)","value":"104120##P##0##0","RefServiceCode":""},
  {"text":"B/L Total Knee Replacement Package (Procedure) (104121)","value":"104121##P##0##0","RefServiceCode":""},
  {"text":"Ball Bandage(Cghs) (104122)","value":"104122##P##0##0","RefServiceCode":""},
  {"text":"Bandage & Strappings For Fractures(Cghs) (104111)","value":"104111##P##0##0","RefServiceCode":""},
  {"text":"below elbow plaster application imported (104834)","value":"104834##P##0##0","RefServiceCode":" "},
  {"text":"BELOW ELBOW PLASTER APPLICATION WP (104826)","value":"104826##P##0##0","RefServiceCode":" "},
  {"text":"BELOW ELBOW PLASTER IMPORTED (104895)","value":"104895##P##0##0","RefServiceCode":" "},
  {"text":"BELOW ELBOW PLASTER LITE WEIGHT (104896)","value":"104896##P##0##0","RefServiceCode":" "},
  {"text":"BELOW ELBOW PLASTER WATER PROOF (104897)","value":"104897##P##0##0","RefServiceCode":" "},
  {"text":"Below Knee Full Plaster(Cghs) (104112)","value":"104112##P##0##0","RefServiceCode":""},
  {"text":"BELOW KNEE PLASTER APPLICATION LITE WEIGHT (104839)","value":"104839##P##0##0","RefServiceCode":" "},
  {"text":"BELOW KNEE PLASTER IMPORTED (104901)","value":"104901##P##0##0","RefServiceCode":" "},
  {"text":"BELOW KNEE PLASTER LITE WEIGHT (104902)","value":"104902##P##0##0","RefServiceCode":" "},
  {"text":"BELOW KNEE PLASTER WATER PROOF (104903)","value":"104903##P##0##0","RefServiceCode":" "},
  {"text":"Below knee plaster WP (104831)","value":"104831##P##0##0","RefServiceCode":" "},
  {"text":"Below Knee Post-Slab(Cghs) (104113)","value":"104113##P##0##0","RefServiceCode":""},
  {"text":"Bencarf Repair Shoulder(CGHS) (104114)","value":"104114##P##0##0","RefServiceCode":""},
  {"text":"Biceps tenodesis(CGHS) (104115)","value":"104115##P##0##0","RefServiceCode":""},
  {"text":"Bicondyler Fracture of Tibia (Haryana Govt) Procedure (104116)","value":"104116##P##0##0","RefServiceCode":""},
  {"text":"Bilateral hip joint replacement/Bilateral Knee joint Transplantation (both) (Haryana Govt) Procedure (104105)","value":"104105##P##0##0","RefServiceCode":""},
  {"text":"Bilateral Total Knee Replacement (104106)","value":"104106##P##0##0","RefServiceCode":""},
  {"text":"Biopsy Bone And Soft Tissue (104107)","value":"104107##P##0##0","RefServiceCode":""},
  {"text":"Biopsy Muscle (Deep) (104108)","value":"104108##P##0##0","RefServiceCode":""},
  {"text":"Bipolar Hemiarthroplasty (104109)","value":"104109##P##0##0","RefServiceCode":""},
  {"text":"Bone Graftiing For Frature Non Union (104110)","value":"104110##P##0##0","RefServiceCode":""},
  {"text":"Bone Grafting (104099)","value":"104099##P##0##0","RefServiceCode":""},
  {"text":"bone grafting fore nob unions -lower limb (procedure) (Gipsa) (104100)","value":"104100##P##0##0","RefServiceCode":""},
  {"text":"bone grafting fore non unions - upper limb (Procedure) (Gipsa) (104101)","value":"104101##P##0##0","RefServiceCode":""},
  {"text":"Bone Grafting Fore Non Unions Lower Limb (Procedure) (104102)","value":"104102##P##0##0","RefServiceCode":""},
  {"text":"Bone Grafting Fore Non Uniouns Lower Limb (Procedure) (104103)","value":"104103##P##0##0","RefServiceCode":""},
  {"text":"Bone Grafting Fore Non Uniouns Upper Limb (Procedure) (104104)","value":"104104##P##0##0","RefServiceCode":""},
  {"text":"Bone Grafting(CGHS) (104093)","value":"104093##P##0##0","RefServiceCode":""},
  {"text":"Bone Tumour With Multiple Grafting (104094)","value":"104094##P##0##0","RefServiceCode":""},
  {"text":"C1-C2 Closed Reduction (104095)","value":"104095##P##0##0","RefServiceCode":""},
  {"text":"CALCANEAL FRACTURE -WITH PLATES (PROCEDURE) (Gipsa) (104096)","value":"104096##P##0##0","RefServiceCode":""},
  {"text":"Calcaneal Fracture with Plates (Procedure) (104097)","value":"104097##P##0##0","RefServiceCode":""},
  {"text":"Cancellous Screw Fixation Femur Lower End (104098)","value":"104098##P##0##0","RefServiceCode":""},
  {"text":"Cancellous Screw Fixation Fracture Neck Femur (104087)","value":"104087##P##0##0","RefServiceCode":""},
  {"text":"Cannulated Screw Fixation (Closed) (104088)","value":"104088##P##0##0","RefServiceCode":""},
  {"text":"Capsulotomy of Shoulder(CGHS) (104089)","value":"104089##P##0##0","RefServiceCode":""},
  {"text":"Carpal Tunnel Decompression (Ortho) (B/L) (104090)","value":"104090##P##0##0","RefServiceCode":""},
  {"text":"Carpal Tunnel Decompression (Ortho) (Single) (104091)","value":"104091##P##0##0","RefServiceCode":""},
  {"text":"CARPAL TUNNEL SYNDROME ( NERVE DECOMPRESSION) (ICICI) Procedure (104092)","value":"104092##P##0##0","RefServiceCode":""},
  {"text":"CARPEL TUNNEL RELEASE -BILATERAL (PROCEDURE) (Gipsa) (104081)","value":"104081##P##0##0","RefServiceCode":""},
  {"text":"Carpel Tunnel Release- Bilateral (Procedure) (104082)","value":"104082##P##0##0","RefServiceCode":""},
  {"text":"Carpel Tunnel Release- Unilateral (Procedure) (104083)","value":"104083##P##0##0","RefServiceCode":""},
  {"text":"CARPEL TUNNEL RELEASE- UNILATERAL (PROCEDURE) (Gipsa) (104084)","value":"104084##P##0##0","RefServiceCode":""},
  {"text":"Caudal Epidural Inj. (104085)","value":"104085##P##0##0","RefServiceCode":""},
  {"text":"Cervical Disc Replacement 1 Level Revision (104086)","value":"104086##P##0##0","RefServiceCode":""},
  {"text":"Cervical Spine Discectomy (Haryana Govt) Procedure (104075)","value":"104075##P##0##0","RefServiceCode":""},
  {"text":"Change Of Tibal Articular Height (104076)","value":"104076##P##0##0","RefServiceCode":""},
  {"text":"Chest Strapping (104077)","value":"104077##P##0##0","RefServiceCode":""},
  {"text":"Chest Strapping (104078)","value":"104078##P##0##0","RefServiceCode":""},
  {"text":"Close Reduction And Upper Tivial Skeletal Traction (104079)","value":"104079##P##0##0","RefServiceCode":""},
  {"text":"Close Reduction Fracture Olecranon (Haryana Govt) Procedure (104080)","value":"104080##P##0##0","RefServiceCode":""},
  {"text":"Close Reduction Fracture/Dislocation Under General Anaesthesia (Haryana Govt) Procedure (104069)","value":"104069##P##0##0","RefServiceCode":""},
  {"text":"Close Reduction Of Dislocation (Day Care) (Gipsa) Procedure (104070)","value":"104070##P##0##0","RefServiceCode":""},
  {"text":"Close Reduction of Dislocation (Day Care) (Procedure) (104071)","value":"104071##P##0##0","RefServiceCode":""},
  {"text":"Close Reduction of Dislocations(CGHS) (104072)","value":"104072##P##0##0","RefServiceCode":""},
  {"text":"Close Reduction of Fracture of Limbs and POP (Day Care) (Gipsa) Procedure (104073)","value":"104073##P##0##0","RefServiceCode":""},
  {"text":"Close Reduction Of Fracture Of Limbs and POP (Day Care) (Procedure) (104074)","value":"104074##P##0##0","RefServiceCode":""},
  {"text":"Close Reduction Of Fractures Of Limb & P.O.P(Cghs) (104063)","value":"104063##P##0##0","RefServiceCode":""},
  {"text":"Closed Nailing Of Long Bones - Humerus (104064)","value":"104064##P##0##0","RefServiceCode":""},
  {"text":"Closed Reduction And Interlocked Nailing Of Femur (104065)","value":"104065##P##0##0","RefServiceCode":""},
  {"text":"Closed Reduction And Interlocking Nailing Of Tibia (104066)","value":"104066##P##0##0","RefServiceCode":""},
  {"text":"Closed Reduction And Plaster Application For Fracture (104067)","value":"104067##P##0##0","RefServiceCode":""},
  {"text":"Closed Reduction Of Joint Disclocation (104068)","value":"104068##P##0##0","RefServiceCode":""},
  {"text":"Closed Reduction Of Shoulder Dislocation (104057)","value":"104057##P##0##0","RefServiceCode":""},
  {"text":"Closed Reduction Of Small Joints (104058)","value":"104058##P##0##0","RefServiceCode":""},
  {"text":"Closed Reduction Of Small Joints - Mp (104059)","value":"104059##P##0##0","RefServiceCode":""},
  {"text":"Closed Reduction Of Small Joints - Mtp (104060)","value":"104060##P##0##0","RefServiceCode":""},
  {"text":"Closed Reduction-Dislocation-Major (Star Health) (104061)","value":"104061##P##0##0","RefServiceCode":""},
  {"text":"CLOSED REDUCTION-DISLOCATION-MINOR (Star Health) Procedure (104062)","value":"104062##P##0##0","RefServiceCode":""},
  {"text":"Coccyx Excision-Procedure (104051)","value":"104051##P##0##0","RefServiceCode":""},
  {"text":"Cochlear Implant Surgery - (ESIC-284) (104052)","value":"104052##P##0##0","RefServiceCode":""},
  {"text":"Collar And Cuff Sling(Cghs) (104053)","value":"104053##P##0##0","RefServiceCode":""},
  {"text":"Colles Fracture - Full Plaster(Cghs) (104054)","value":"104054##P##0##0","RefServiceCode":""},
  {"text":"Colles Fracture - Below Elbow(Cghs) (104055)","value":"104055##P##0##0","RefServiceCode":""},
  {"text":"Colles Fracture Ant. Or Post. Slab(Cghs) (104056)","value":"104056##P##0##0","RefServiceCode":""},
  {"text":"Colles Fracture Closed Reduction & Pop Cast (104045)","value":"104045##P##0##0","RefServiceCode":""},
  {"text":"Combined Anterior & Posterior Spinal Surgery (104046)","value":"104046##P##0##0","RefServiceCode":""},
  {"text":"Complex Knee Ligament Reconstruction & Stabilisation (104047)","value":"104047##P##0##0","RefServiceCode":""},
  {"text":"Complex Orif Hand (104048)","value":"104048##P##0##0","RefServiceCode":""},
  {"text":"Complex Spine Instrumentation (104049)","value":"104049##P##0##0","RefServiceCode":""},
  {"text":"Complex Spine Resection & Reconstruction (104050)","value":"104050##P##0##0","RefServiceCode":""},
  {"text":"Conservative Pop(Cghs) (104039)","value":"104039##P##0##0","RefServiceCode":""},
  {"text":"Contracture Release (104040)","value":"104040##P##0##0","RefServiceCode":""},
  {"text":"Core Decompression U/L Hip (104041)","value":"104041##P##0##0","RefServiceCode":""},
  {"text":"Corrective Lesser Toe Surgery (104042)","value":"104042##P##0##0","RefServiceCode":""},
  {"text":"Corrective Ostectomy & Internal Fixation - long bones(CGHS) (104043)","value":"104043##P##0##0","RefServiceCode":""},
  {"text":"Corrective Ostectomy & Internal Fixation - short bones(CGHS) (104044)","value":"104044##P##0##0","RefServiceCode":""},
  {"text":"Corrective Spinal Osteotomy & Fusion (104033)","value":"104033##P##0##0","RefServiceCode":""},
  {"text":"Costo - Transversectomy (104034)","value":"104034##P##0##0","RefServiceCode":""},
  {"text":"Crush Injury Major (104035)","value":"104035##P##0##0","RefServiceCode":""},
  {"text":"Crush Injury Minor (104036)","value":"104036##P##0##0","RefServiceCode":""},
  {"text":"Ctev - Manipulation (104037)","value":"104037##P##0##0","RefServiceCode":""},
  {"text":"Ctev - Surgery (104038)","value":"104038##P##0##0","RefServiceCode":""},
  {"text":"Ctev Neglected . Jess Fixator - (ESIC-38) (104027)","value":"104027##P##0##0","RefServiceCode":""},
  {"text":"Curettage Of Tumor & Bone Grafting (104028)","value":"104028##P##0##0","RefServiceCode":""},
  {"text":"Curretage Of Osteomyliticavity & Synovectomy (104029)","value":"104029##P##0##0","RefServiceCode":""},
  {"text":"Debridement With Large Area Full Thickness Skin Grafting (104030)","value":"104030##P##0##0","RefServiceCode":""},
  {"text":"Debridement With Saucerization With Imp Of Genta Beeds (104031)","value":"104031##P##0##0","RefServiceCode":""},
  {"text":"Decompression Spine Posterior Approach/ Laminectomy >3 Levels (104032)","value":"104032##P##0##0","RefServiceCode":""},
  {"text":"Decompression Spine Posterior Approach/ Laminectomy 1Level (104021)","value":"104021##P##0##0","RefServiceCode":""},
  {"text":"Decompression Spine Posterior Approach/ Laminectomy 2 -3 Levels-Spine (104022)","value":"104022##P##0##0","RefServiceCode":""},
  {"text":"Dequervians Release-Wrist/Hand (104023)","value":"104023##P##0##0","RefServiceCode":""},
  {"text":"DHS for Fracture Neck Femur(CGHS) (104024)","value":"104024##P##0##0","RefServiceCode":""},
  {"text":"DHS-BILATERAL HIP (ICICI) Procedure (104025)","value":"104025##P##0##0","RefServiceCode":""},
  {"text":"DHS-SINGLE HIP (ICICI) Procedure (104026)","value":"104026##P##0##0","RefServiceCode":""},
  {"text":"Dhs/ Cannulated Screw Fixation For Proximal Femoral (104015)","value":"104015##P##0##0","RefServiceCode":""},
  {"text":"Dhs/Dcs (Complex) (104016)","value":"104016##P##0##0","RefServiceCode":""},
  {"text":"Diagnostic Arthroscopy (Haryana Govt) Procedure (104017)","value":"104017##P##0##0","RefServiceCode":""},
  {"text":"Diagnostic Arthroscopy - Ankle (104018)","value":"104018##P##0##0","RefServiceCode":""},
  {"text":"Diagnostic Arthroscopy - Hip (104019)","value":"104019##P##0##0","RefServiceCode":""},
  {"text":"Diagnostic Arthroscopy - Knee (104020)","value":"104020##P##0##0","RefServiceCode":""},
  {"text":"Diagnostic Arthroscopy - Shoulder (104009)","value":"104009##P##0##0","RefServiceCode":""},
  {"text":"Diagnostic Arthroscopy - Wrist (104010)","value":"104010##P##0##0","RefServiceCode":""},
  {"text":"Difficult & Multiple Fracture Fixation (104011)","value":"104011##P##0##0","RefServiceCode":""},
  {"text":"Disarticulation - Ankle (104012)","value":"104012##P##0##0","RefServiceCode":""},
  {"text":"Disarticulation - Hip (104013)","value":"104013##P##0##0","RefServiceCode":""},
  {"text":"Disarticulation - Wrist (104014)","value":"104014##P##0##0","RefServiceCode":""},
  {"text":"Disarticulation -Elbow (104003)","value":"104003##P##0##0","RefServiceCode":""},
  {"text":"Disarticulation Hip (Haryana Govt) Procedure (104004)","value":"104004##P##0##0","RefServiceCode":""},
  {"text":"Disarticulation Shoulder (Haryana Govt) Procedure (104005)","value":"104005##P##0##0","RefServiceCode":""},
  {"text":"Disarticulations - Major joint(CGHS) (104006)","value":"104006##P##0##0","RefServiceCode":""},
  {"text":"Disarticulations - Minor joint(CGHS) (104007)","value":"104007##P##0##0","RefServiceCode":""},
  {"text":"Discectomy Microdiscectomy-Spine (104008)","value":"104008##P##0##0","RefServiceCode":""},
  {"text":"Discectomy/ Micro Discectomy(CGHS) (103997)","value":"103997##P##0##0","RefServiceCode":""},
  {"text":"DISCETOMY (ICICI) Procedure (103998)","value":"103998##P##0##0","RefServiceCode":""},
  {"text":"Distal biceps tendon repair(CGHS) (103999)","value":"103999##P##0##0","RefServiceCode":""},
  {"text":"Double Hip Spica(Cghs) (104000)","value":"104000##P##0##0","RefServiceCode":""},
  {"text":"Drainage Abscess (Incision & Drainage) (104001)","value":"104001##P##0##0","RefServiceCode":""},
  {"text":"Dressing Extra Large (Ortho Opd) (104002)","value":"104002##P##0##0","RefServiceCode":""},
  {"text":"Dressing Large (Ortho Opd) (103991)","value":"103991##P##0##0","RefServiceCode":""},
  {"text":"Dressing Medium (Ortho Opd) (103992)","value":"103992##P##0##0","RefServiceCode":""},
  {"text":"Dressing Small (Ortho Opd) (103993)","value":"103993##P##0##0","RefServiceCode":""},
  {"text":"Dsn (103994)","value":"103994##P##0##0","RefServiceCode":""},
  {"text":"Endoscopic Spine Biopsy (103995)","value":"103995##P##0##0","RefServiceCode":""},
  {"text":"Endoscopic Spine Decompression (103996)","value":"103996##P##0##0","RefServiceCode":""},
  {"text":"Excision Head Of Radius (103985)","value":"103985##P##0##0","RefServiceCode":""},
  {"text":"EXCISION OF BONE TUMOURS DEEP (ICICI) Procedure (103986)","value":"103986##P##0##0","RefServiceCode":""},
  {
    "text": "EXCISION OF BONE TUMOURS SUSPERFICAL  (ICICI) Procedure (103987)",
    "value": "103987##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Excision of Bone Tumours(CGHS) (103988)",
    "value": "103988##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Excision of Fracture Radial Head (Haryana Govt) Procedure (103989)",
    "value": "103989##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Excision Of Lower End Ulna (103990)",
    "value": "103990##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Excision Of Tumour Mass (103979)",
    "value": "103979##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Excision or other Operations for Scaphoid Fractures(CGHS) (103980)",
    "value": "103980##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "External Fixation Pelvis (103981)",
    "value": "103981##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "External Fixator Foot & Ankle (103982)",
    "value": "103982##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "External Fixator For Fracture Long Bones Lower Limb (103983)",
    "value": "103983##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "External Fixator For Fracture Long Bones Upper Limb (103984)",
    "value": "103984##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Fasciotomy (103973)",
    "value": "103973##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Fasciotomy - Leg (103974)",
    "value": "103974##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Femoral Osteotomy Around Knee (Procedure) (103975)",
    "value": "103975##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Femur Shaft Fracture- Proximal / middle/ Distal -(Excluding implant) (Gipsa) (103976)",
    "value": "103976##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Femur Shaft Fracture- Proximal / middle/ Distal -(Excluding implant) (Gipsa) (Procedure) (Gipsa) (103977)",
    "value": "103977##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Femur Shaft Fracture-Proximal/Middle/Distal(Excluding Implant) (Procedure) (103978)",
    "value": "103978##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Fibula Grafting (103967)",
    "value": "103967##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Fibulectomy (103968)",
    "value": "103968##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Figure Of 8 Bandage(Cghs) (103969)",
    "value": "103969##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Figurs Of 8 Bandage (103970)",
    "value": "103970##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Finger Reconstruction Simple (103971)",
    "value": "103971##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Fingers (Post Slab)(Cghs) (103972)",
    "value": "103972##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Fingers Full Plaster(Cghs) (103961)",
    "value": "103961##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Fixation of Fracture Calcaneum (Haryana Govt) Procedure (103962)",
    "value": "103962##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Fixation of Fracture Distal radius (Haryana Govt) Procedure (103963)",
    "value": "103963##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Fixation of Fracture Metarsals/phalanges (Haryana Govt) Procedure (103964)",
    "value": "103964##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Fixation of Fracture Scaphoid (Haryana Govt) Procedure (103965)",
    "value": "103965##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Fixation of Fracture Talus (Haryana Govt) Procedure (103966)",
    "value": "103966##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Foot Fractures With Screws (Procedure) (103955)",
    "value": "103955##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Foot Fractures With Wires (Procedure) (103956)",
    "value": "103956##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Foot Fractures- With Screws (Gipsa) (Procedure)  (103957)",
    "value": "103957##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Foot Fractures- With Wires (Gipsa) (Procedure) (103958)",
    "value": "103958##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Foreign Body Removal (Ortho) (103959)",
    "value": "103959##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Forequarter Amputation (Haryana Govt) Procedure (103960)",
    "value": "103960##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Fracture both bones forearm plating (Haryana Govt) Procedure (103949)",
    "value": "103949##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Fracture Neck Femur (Implant Excluded) (Gipsa) Procedure (103950)",
    "value": "103950##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Fracture Neck Femur (Procedure) (103951)",
    "value": "103951##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Fracture Neck Femur + Cost of Implant (Apollo) Procedure (103952)",
    "value": "103952##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Fracture Neck Femur+ Cost of Implant HDFC Procedure (103953)",
    "value": "103953##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Fracture of Greater Tuberosity Humerus (Haryana Govt) Procedure (103954)",
    "value": "103954##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Fracture Olecranon (Haryana Govt) Procedure (103943)",
    "value": "103943##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Fracture Patella (Haryana Govt) Procedure (103944)",
    "value": "103944##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Fracture shaft of humerus (Haryana Govt) Procedure (103945)",
    "value": "103945##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Fracture Trochenteric Femur (Haryana Govt) Procedure (103946)",
    "value": "103946##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Fusion - Posterior Spinal (103947)",
    "value": "103947##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Fusion - Sacroiliac (103948)",
    "value": "103948##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Fusion - Sub Talar (103937)",
    "value": "103937##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Fusion - Tripple Arthrodesis (103938)",
    "value": "103938##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Fusion Surgery Cervical/ Lumbar Spine  upto  2 Level(CGHS) (103939)",
    "value": "103939##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Galeazzs Fracture With Dislocation (103940)",
    "value": "103940##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Gastronemius Cyst Excision (103941)",
    "value": "103941##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Girdle Stone Arthroplasty (103942)",
    "value": "103942##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Hamstring Release (103931)",
    "value": "103931##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Hand K Wire Single Fracture (Procedure) (103932)",
    "value": "103932##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Hand K Wires Multiple Fracture (Gipsa) Procedure (103933)",
    "value": "103933##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Hand K Wires Single Fracture (Gipsa) Procedure (103934)",
    "value": "103934##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Hemiarthroplasty Hip (Haryana Govt) Procedure (103935)",
    "value": "103935##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Hemiarthroplasty- Hip(CGHS) (103936)",
    "value": "103936##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Hemiarthroplasty- Shoulder(CGHS) (103925)",
    "value": "103925##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Hindquarter Amputation (Haryana Govt) Procedure (103926)",
    "value": "103926##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Hip Arthrotomy (103927)",
    "value": "103927##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Hip Replacement (Bilateral) (Procedure) (103928)",
    "value": "103928##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Hip Replacement (Unilateral) (Procedure) (103929)",
    "value": "103929##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "HIP Replacement (With Implant- Unilateral) + Cost of Impalnt (Apollo) Procedure (103930)",
    "value": "103930##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "HIP Replacement UL With Implant HDFC Procedure (103919)",
    "value": "103919##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "HIP REPLACMENT  (ICICI) Procedure (103920)",
    "value": "103920##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Hip Replacment Unilateral or Impalnt Excluded (Gipsa) Procedure (103921)",
    "value": "103921##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Hip Transplant (single) (Haryana Govt) Procedure (103922)",
    "value": "103922##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Ilizarov & Complex External Fixator (103923)",
    "value": "103923##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Ilizarov Ring Fixator Application  -  (ESIC-37) (103924)",
    "value": "103924##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Ilizarov's external fixator(CGHS) (103913)",
    "value": "103913##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Illizarov/ external fixation for limb lengthening/ deformity correction(CGHS) (103914)",
    "value": "103914##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Illizarov’s / External Fixation for Trauma(CGHS) (103915)",
    "value": "103915##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Implant Removal of Femur/ Tibia (Procedure) (103916)",
    "value": "103916##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Implant Removal of Femur/Tibia (Procedure) (103917)",
    "value": "103917##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Implant Removal of Small Bones (Procedure) (103918)",
    "value": "103918##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "IMPLANT REMOVAL-MAJOR (Star Health) Procedure (103907)",
    "value": "103907##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Implants Removal OF Small Bones (Gipsa) Procedure (103908)",
    "value": "103908##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Infected Tka First Stage (103909)",
    "value": "103909##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Infected Tka Joint Debridement (103910)",
    "value": "103910##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Infected Tka Second Stage (103911)",
    "value": "103911##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Ingrowing Nail Removal (Per Nail) (103912)",
    "value": "103912##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Inj. Aclasta(Procedure ) (103901)",
    "value": "103901##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Inj. Synvisc(Procedure) (103902)",
    "value": "103902##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Injection Costochondral Junction (103903)",
    "value": "103903##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Interlocking Nailing Femur With Bone Grafting (103904)",
    "value": "103904##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Internal Fixation Pelvis (103905)",
    "value": "103905##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Intra aricular injection (104829)",
    "value": "104829##P##0##0",
    "RefServiceCode": " "
  },
  {
    "text": "Intra articular Injection (104830)",
    "value": "104830##P##0##0",
    "RefServiceCode": " "
  },
  {
    "text": "Jess Distractor L/E Radius +/- K -Wire Fixation (103906)",
    "value": "103906##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Jess Fixator Major (103895)",
    "value": "103895##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Jess Fixator Minor (103896)",
    "value": "103896##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Joint Aspiration(Proc) (103897)",
    "value": "103897##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Joints Aspiration(Cghs) (103898)",
    "value": "103898##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "K - Wire Fixation Of Small Bones - Foot (103899)",
    "value": "103899##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "K - Wire Fixation Of Small Bones - Hand (103900)",
    "value": "103900##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Knee Aspiration (103889)",
    "value": "103889##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Knee Collateral Ligament Reconstruction(CGHS) (103890)",
    "value": "103890##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Knee Transplant (single) (Haryana Govt) Procedure (103891)",
    "value": "103891##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Laminectomy Excision Disc and Tumours(CGHS) (103892)",
    "value": "103892##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Laminectomy(CGHS) (103893)",
    "value": "103893##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "LAMINECTOMY,EXCISION & TUMORS  (ICICI) Procedure (103894)",
    "value": "103894##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Laminectomy/ Disectomy (Gipsa) Procedure (103883)",
    "value": "103883##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "LAMINECTOMY/DISCECTOMY (Star Health) Procedure (103884)",
    "value": "103884##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Laminectomy/Discesctomy (Procedure) (103885)",
    "value": "103885##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Lateral Condyle Of Humers Excision (103886)",
    "value": "103886##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Lateral Condyler/Subcondyler Fracture of Humerus in case of Child (Haryana Govt) Procedure (103887)",
    "value": "103887##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Lateral Soft Tissue Release Bk (103888)",
    "value": "103888##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Limb Salvage & Implantation Of Mega Prosthesis (103877)",
    "value": "103877##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Lisfrenes Fracture Dislocation (Haryana Govt) Procedure (103878)",
    "value": "103878##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Local Flaps (103879)",
    "value": "103879##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Locking Compression Plating ( Lcp ) Fixation (103880)",
    "value": "103880##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Lumber Decompression/Laminectomy for Canalstenosis (Haryana Govt) Procedure (103881)",
    "value": "103881##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Lumber Discectomy (Haryana Govt) Procedure (103882)",
    "value": "103882##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Lumber Microdiscectomy (Haryana Govt) Procedure (103871)",
    "value": "103871##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Manipulation Of Joints (103872)",
    "value": "103872##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Manipulation Of Joints - Elbow (103873)",
    "value": "103873##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Manipulation Of Joints - Knee (103874)",
    "value": "103874##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Manipulation Of Joints - Shoulder (103875)",
    "value": "103875##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Manipulation With I/A Inj. Depo-Medrol (103876)",
    "value": "103876##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "MCL Reconstruction/ Repair (Procedure) (103865)",
    "value": "103865##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "MCL Reconstruction/Repair (Gipsa) Procedure (103866)",
    "value": "103866##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Medical Soft Tissue Tightening Ak (103867)",
    "value": "103867##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Medical Soft Tissue Tightening Bk (103868)",
    "value": "103868##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Meniscectomy(CGHS) (103869)",
    "value": "103869##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Meniscus Repair(CGHS) (103870)",
    "value": "103870##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "MENISECTOMY  (ICICI) Procedure (103859)",
    "value": "103859##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Menisectomy (Haryana Govt) Procedure (103860)",
    "value": "103860##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Microlumbar Discectomy (103861)",
    "value": "103861##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Microvascular Free Flap (103862)",
    "value": "103862##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Minerva Jacket(Cghs) (103863)",
    "value": "103863##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Mini Fixator for Hand/Foot(CGHS) (103864)",
    "value": "103864##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Mole Removal (103853)",
    "value": "103853##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Mole Removal (103854)",
    "value": "103854##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Monteggia Fracture With Dislocation (103855)",
    "value": "103855##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "More than 2 Level(CGHS) (103856)",
    "value": "103856##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Multiple Hand Fracture & Tendon Injuries With Ssg (103857)",
    "value": "103857##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Multiple Hand Fracture Without Skin Loss (103858)",
    "value": "103858##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Multiple Pinning Fracture Neck Femur(CGHS) (103847)",
    "value": "103847##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Myocutaneous and Fasciocutaneous FlaP Procedures forLimbs(CGHS) (103848)",
    "value": "103848##P##0##0",
    "RefServiceCode": ""
  },
  {
    "text": "Myocutaneous Flap (103849)",
    "value": "103849##P##0##0",
    "RefServiceCode": ""
  }
];

const parseData = () => {
  const map = new Map();

  userList1.forEach(item => {
    const code = item.serviceCode || (item.value ? item.value.split('##')[0] : '');
    const name = item.serviceName;
    if (code && name) {
      map.set(code, {
        code: `ORTHO-${code}`,
        name: name,
        dept: "Orthopedics",
        rate: 1000
      });
    }
  });

  userList2.forEach(item => {
    const code = item.value ? item.value.split('##')[0] : '';
    const name = item.text;
    if (code && name) {
      map.set(code, {
        code: `ORTHO-${code}`,
        name: name,
        dept: "Orthopedics",
        rate: 1000
      });
    }
  });

  const existingFile = path.join(__dirname, '../src/modules/billing/data/orthopedicsServices.ts');
  const content = fs.readFileSync(existingFile, 'utf8');

  // Regex parse existing array
  const matches = content.matchAll(/{\s*"code":\s*"(.*?)",\s*"name":\s*"(.*?)",\s*"dept":\s*"(.*?)",\s*"rate":\s*(\d+)\s*}/g);
  for (const m of matches) {
    const codeFull = m[1];
    const codeClean = codeFull.replace('ORTHO-', '');
    if (!map.has(codeClean)) {
      map.set(codeClean, {
        code: codeFull,
        name: m[2],
        dept: "Orthopedics",
        rate: parseInt(m[4], 10)
      });
    }
  }

  const result = Array.from(map.values());
  const tsContent = `export const ORTHOPEDICS_SERVICES = ${JSON.stringify(result, null, 2)};\n`;
  fs.writeFileSync(existingFile, tsContent, 'utf8');
  console.log(`Successfully written ${result.length} Orthopedics services.`);
};

parseData();
