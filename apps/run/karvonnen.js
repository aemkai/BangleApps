// Korvonnen pasted inside a function
exports.show = function karvonnen(hrmSettings, exsHrmStats) {
  //This app is an extra feature implementation for the Run.app of the bangle.js. It's called run+
  //The calculation of the Heart Rate Zones is based on the Karvonnen method. It requires to know maximum and minimum heart rates. More precise calculation methods require a lab.
  //Other methods are even more approximative.
  wu = require("widget_utils");
  wu.hide();
  let R = Bangle.appRect;
  
  g.reset().clearRect(R);
  
  function drawLines() {
    g.drawLine(40,64,88,52,136,64);
    g.drawLine(88,52,136,64);
    g.drawLine(40,112,88,124);
    g.drawLine(88,124,132,112);
    g.setFont("Vector",20);
  }
  
  //To calculate Heart rate zones, we need to know the heart rate reserve (HRR)
  // HRR = maximum HR - Minimum HR. minhr is minimum hr, maxhr is maximum hr.
  //get the hrr (heart rate reserve).
  // I put random data here, but this has to come as a menu in the settings section so that users can change it.
  let minhr = hrmSettings.min;
  let maxhr = hrmSettings.max;
  
  function calculatehrr(minhr, maxhr) {
    return maxhr - minhr;}
  
  //test input for hrr (it works).
  let hrr = calculatehrr(minhr, maxhr);
  console.log(hrr);
  
  //Test input to verify the zones work. The following value for "hr" has to be deleted and replaced with the Heart Rate Monitor input.
  let hr = exsHrmStats.getValue();
  let hr1 = hr;
  // These letiables display next and previous HR zone.
  //get the hrzones right. The calculation of the Heart rate zones here is based on the Karvonnen method
  //60-70% of HRR+minHR = zone2. //70-80% of HRR+minHR = zone3. //80-90% of HRR+minHR = zone4. //90-99% of HRR+minHR = zone5. //=>99% of HRR+minHR = serious risk of heart attack
  let minzone2 = hrr * 0.6 + minhr;
  let maxzone2 = hrr * 0.7 + minhr;
  let maxzone3 = hrr * 0.8 + minhr;
  let maxzone4 = hrr * 0.9 + minhr;
  let maxzone5 = hrr * 0.99 + minhr;
  
  // HR data: large, readable, in the middle of the screen
  function drawHR() {
    g.clearRect(62,66,62+90,70+40);
    g.setColor(1,1,1);
    g.setFont("Vector",50);
    g.drawString(hr, 62,66);
  }
  drawHR();
  //These functions call arcs to show different HR zones.
  
  //To shorten the code, I'll reference some letiables and reuse them.
  let centreX = R.x + 0.5 * R.w; //g.getWidth();
  let centreY = R.y + 0.5 * R.h; //g.getWidth();
  let minRadius = 0.38 * R.h; //g.getWidth();
  let maxRadius = 0.50 * R.h; //g.getWidth();
  
  //draw background image (dithered green zones)(I should draw different zones in different dithered colors)
  const HRzones= require("graphics_utils");
  let minRadiusz = 0.44 * R.h;//g.getWidth();
  let startAngle = HRzones.degreesToRadians(-88.5);
  let endAngle = HRzones.degreesToRadians(268.5);

  function drawBackGround() {
    g.setColor("#002200");
    HRzones.fillArc(g, centreX, centreY, minRadiusz, maxRadius, startAngle, endAngle);
  }
  drawBackGround();
  
  const zones = require("graphics_utils");
  //####### A function to simplify a bit the code ######
  function simplify (sA, eA, Z, currentZone, lastZone) {
    let startAngle = zones.degreesToRadians(sA);
    let endAngle = zones.degreesToRadians(eA);
    if (currentZone == lastZone) zones.fillArc(g, centreX, centreY, minRadius, maxRadius, startAngle, endAngle);
    else zones.fillArc(g, centreX, centreY, minRadiusz, maxRadius, startAngle, endAngle);
    g.setFont("Vector",24);
    g.clearRect(29,80,29+26,80+24);
    g.drawString(Z, 29,80);
  }

  //####### A function to simplify next&previous zones ######
  function zoning (max, min) {
    g.setFont("Vector",20);
    g.setColor(1,1,1);
    g.clearRect(56,28,56+20*3,28+20).clearRect(60,128,60+20*3,128+20);
    g.drawString(max, 56,28);g.drawString(min, 60,128);
  }

  function clearInnerRing() {
    g.setColor(0,0,0);
    HRzones.fillArc(g, centreX, centreY, minRadius-1, minRadiusz, startAngle, endAngle);
  }
  
  function getZone(zone) {
    drawBackGround();
    clearInnerRing();
    if (zone >= 0)  {g.setColor("#00ffff");{(simplify(-88.5, -45, "Z1", 0, zone));}zoning(minzone2, minhr);}
    if (zone >= 1)  {g.setColor("#00ff00");{(simplify(-43.5, -21.5, "Z2", 1, zone));}zoning(maxzone2, minzone2);}
    if (zone >= 2)  {g.setColor("#00ff00");{(simplify(-20, 1.5, "Z2", 2, zone));}zoning(maxzone2, minzone2);}
    if (zone >= 3)  {g.setColor("#00ff00");{(simplify(3, 24, "Z2", 3, zone));}zoning(maxzone2, minzone2);}
    if (zone >= 4)  {g.setColor("#ffff00");{(simplify(25.5, 46.5, "Z3", 4, zone));}zoning(maxzone3, maxzone2);}
    if (zone >= 5)  {g.setColor("#ffff00");{(simplify(48, 69, "Z3", 5, zone));}zoning(maxzone3, maxzone2);}
    if (zone >= 6)  {g.setColor("#ffff00");{(simplify(70.5, 91.5, "Z3", 6, zone));}zoning(maxzone3, maxzone2);}
    if (zone >= 7)  {g.setColor("#ff8000");{(simplify(93, 114.5, "Z4", 7, zone));}zoning(maxzone4, maxzone3);}
    if (zone >= 8)  {g.setColor("#ff8000");{(simplify(116, 137.5, "Z4", 8, zone));}zoning(maxzone4, maxzone3);}
    if (zone >= 9)  {g.setColor("#ff8000");{(simplify(139, 160, "Z4", 9, zone));}zoning(maxzone4, maxzone3);}
    if (zone >= 10) {g.setColor("#ff0000");{(simplify(161.5, 182.5, "Z5", 10, zone));}zoning(maxzone5, maxzone4);}
    if (zone >= 11) {g.setColor("#ff0000");{(simplify(184, 205, "Z5", 11, zone));}zoning(maxzone5, maxzone4);}
    if (zone == 12) {g.setColor("#ff0000");{(simplify(206.5, 227.5, "Z5", 12, zone));}zoning(maxzone5, maxzone4);}
   }

  function getZoneAlert() {
   const HRzonemax = require("graphics_utils");
   let centreX1,centreY1,maxRadius1 = 1;
   let minRadius = 0.40 * R.h;
   let startAngle1 = HRzonemax.degreesToRadians(-90);
   let endAngle1 = HRzonemax.degreesToRadians(270);
   g.setFont("Vector",38);g.setColor("#ff0000");
   HRzonemax.fillArc(g, centreX, centreY, minRadius, maxRadius, startAngle1, endAngle1);
   g.drawString("ALERT", 26,66);
  }
  
  //Subdivided zones for better readability of zones when calling the images. //Changing HR zones will trigger the function with the image and previous&next HR zones.
  let subZoneLast;
  function drawZones() {
    if ((hr < maxhr - 2) && subZoneLast==13) {g.clear(); drawLines(); drawHR();}

    if (hr <= hrr * 0.6 + minhr) {if (subZoneLast!=0) {subZoneLast=0; getZone(subZoneLast);}}
    else if (hr <= hrr * 0.64 + minhr) {if (subZoneLast!=1) {subZoneLast=1; getZone(subZoneLast);}}
    else if (hr <= hrr * 0.67 + minhr) {if (subZoneLast!=2) {subZoneLast=2; getZone(subZoneLast);}}
    else if (hr <= hrr * 0.70 + minhr) {if (subZoneLast!=3) {subZoneLast=3; getZone(subZoneLast);}}
    else if (hr <= hrr * 0.74 + minhr) {if (subZoneLast!=4) {subZoneLast=4; getZone(subZoneLast);}}
    else if (hr <= hrr * 0.77 + minhr) {if (subZoneLast!=5) {subZoneLast=5; getZone(subZoneLast);}}
    else if (hr <= hrr * 0.80 + minhr) {if (subZoneLast!=6) {subZoneLast=6; getZone(subZoneLast);}}
    else if (hr <= hrr * 0.84 + minhr) {if (subZoneLast!=7) {subZoneLast=7; getZone(subZoneLast);}}
    else if (hr <= hrr * 0.87 + minhr) {if (subZoneLast!=8) {subZoneLast=8; getZone(subZoneLast);}}
    else if (hr <= hrr * 0.90 + minhr) {if (subZoneLast!=9) {subZoneLast=9; getZone(subZoneLast);}}
    else if (hr <= hrr * 0.94 + minhr) {if (subZoneLast!=10) {subZoneLast=10; getZone(subZoneLast);}}
    else if (hr <= hrr * 0.96 + minhr) {if (subZoneLast!=11) {subZoneLast=11; getZone(subZoneLast);}}
    else if (hr <= hrr * 0.98 + minhr) {if (subZoneLast!=12) {subZoneLast=12; getZone(subZoneLast);}}
    else if (hr >= maxhr - 2) {if (subZoneLast!=13) {subZoneLast=13; g.clear();getZoneAlert();}}
  }
  drawZones();
  
  let hrLast;
  function updateUI() {
    hrLast = hr;
    hr = exsHrmStats.getValue();
    if (hr!=hrLast) {
      drawHR();
      drawZones();
    }
  }
  updateUI();
  
    karvonnenInterval = setInterval(function() {
      if (!isMenuDisplayed && karvonnenActive) updateUI();
    }, 1000);
  
  return karvonnenInterval;
};
