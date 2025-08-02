// This is the Google Apps Script code that you'll need to deploy
// Go to script.google.com and create a new project with this code

function doGet(e) {
  const action = e.parameter.action

  if (action === "getGuests") {
    return getGuests()
  }

  return ContentService.createTextOutput("Invalid action")
}

function doPost(e) {
  const data = JSON.parse(e.postData.contents)
  const action = data.action

  if (action === "addGuest") {
    return addGuest(data.data)
  } else if (action === "updateGuest") {
    return updateGuest(data.guestId, data.ministerData, data.status, data.completedDate)
  }

  return ContentService.createTextOutput("Invalid action")
}

function addGuest(guestData) {
  const sheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Guests") ||
    SpreadsheetApp.getActiveSpreadsheet().insertSheet("Guests")

  // Add headers if sheet is empty
  if (sheet.getLastRow() === 0) {
    sheet
      .getRange(1, 1, 1, 25)
      .setValues([
        [
          "ID",
          "Full Name",
          "Email",
          "Phone Number",
          "WhatsApp Number",
          "Profession",
          "Birthday",
          "Invited By",
          "Service Day",
          "Gender",
          "Marital Status",
          "House Address",
          "Office Address",
          "Join Church",
          "Join Department",
          "Selected Department",
          "Blessings",
          "Submission Date",
          "Status",
          "Minister Name",
          "Life Class Teacher",
          "HOD in Charge",
          "Joined Church",
          "Department Assigned",
          "Minister Comments",
        ],
      ])
  }

  // Add guest data
  sheet.appendRow([
    guestData.id,
    guestData.fullName,
    guestData.email,
    guestData.phoneNumber,
    guestData.whatsappNumber,
    guestData.profession,
    guestData.birthday,
    guestData.invitedBy,
    guestData.serviceDay,
    guestData.gender,
    guestData.maritalStatus,
    guestData.houseAddress,
    guestData.officeAddress,
    guestData.joinChurch,
    guestData.joinDepartment,
    guestData.selectedDepartment,
    guestData.blessings,
    guestData.submissionDate,
    guestData.status,
    "",
    "",
    "",
    "",
    "",
    "", // Empty minister fields
  ])

  return ContentService.createTextOutput(JSON.stringify({ success: true }))
}

function getGuests() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Guests")
  if (!sheet) {
    return ContentService.createTextOutput(JSON.stringify([]))
  }

  const data = sheet.getDataRange().getValues()
  const headers = data[0]
  const guests = []

  for (let i = 1; i < data.length; i++) {
    const guest = {}
    headers.forEach((header, index) => {
      guest[header.toLowerCase().replace(/\s+/g, "")] = data[i][index]
    })
    guests.push(guest)
  }

  return ContentService.createTextOutput(JSON.stringify(guests))
}

function updateGuest(guestId, ministerData, status, completedDate) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Guests")
  const data = sheet.getDataRange().getValues()

  // Find the row with matching guest ID
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === guestId) {
      // Update minister data columns (19-24)
      sheet.getRange(i + 1, 19).setValue(status)
      sheet.getRange(i + 1, 20).setValue(ministerData.ministerName)
      sheet.getRange(i + 1, 21).setValue(ministerData.lifeClassTeacher)
      sheet.getRange(i + 1, 22).setValue(ministerData.hodInCharge)
      sheet.getRange(i + 1, 23).setValue(ministerData.joinedChurch)
      sheet.getRange(i + 1, 24).setValue(ministerData.department)
      sheet.getRange(i + 1, 25).setValue(ministerData.ministerComment)
      break
    }
  }

  return ContentService.createTextOutput(JSON.stringify({ success: true }))
}

// Declare variables before using them
const ContentService = GoogleAppsScript.ContentService
const SpreadsheetApp = GoogleAppsScript.SpreadsheetApp
