export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const serial = String(body.serial || "").trim().toUpperCase();

    if (!serial || serial.length > 80) {
      return Response.json(
        { verified: false, message: "Enter a valid serial number." },
        { status: 400 }
      );
    }

    const record = await context.env.DB.prepare(`
      SELECT
        serial_number,
        product_name,
        strength,
        task_number,
        batch_number,
        analysis_date,
        measured_result,
        purity,
        certificate_url,
        status
      FROM certificates
      WHERE UPPER(serial_number) = ?
      LIMIT 1
    `).bind(serial).first();

    if (!record || record.status !== "active") {
      return Response.json(
        {
          verified: false,
          message: "No active certificate was found for this serial number."
        },
        { status: 404 }
      );
    }

    return Response.json({
      verified: true,
      certificate: {
        serial: record.serial_number,
        product: record.product_name,
        strength: record.strength,
        taskNumber: record.task_number,
        batch: record.batch_number,
        analysisDate: record.analysis_date,
        result: record.measured_result,
        purity: record.purity,
        certificate: record.certificate_url
      }
    });
  } catch (error) {
    console.error("Certificate verification failed:", error);
    return Response.json(
      {
        verified: false,
        message: "Verification is temporarily unavailable. Please try again."
      },
      { status: 500 }
    );
  }
}
