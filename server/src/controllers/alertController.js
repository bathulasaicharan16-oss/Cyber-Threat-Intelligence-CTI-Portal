import Alert from '../models/Alert.js';

export const getAlerts = async (req, res) => {
  try {
    const { status, severity, limit = 50 } = req.query;
    const filter = {};

    if (status && status !== 'ALL') {
      filter.status = status;
    }
    if (severity && severity !== 'ALL') {
      filter.severity = severity;
    }

    const alerts = await Alert.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    // Stats breakdown
    const total = await Alert.countDocuments();
    const unread = await Alert.countDocuments({ status: 'UNREAD' });
    const critical = await Alert.countDocuments({ severity: 'CRITICAL', status: { $ne: 'DISMISSED' } });
    const high = await Alert.countDocuments({ severity: 'HIGH', status: { $ne: 'DISMISSED' } });

    res.status(200).json({
      success: true,
      counts: { total, unread, critical, high },
      data: alerts,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const markAlertRead = async (req, res) => {
  try {
    const { alertId } = req.params;
    const alert = await Alert.findOne({ alertId });
    if (!alert) {
      return res.status(404).json({ success: false, error: `Alert ${alertId} not found.` });
    }

    // Method: markRead() (State transition: UNREAD -> READ)
    await alert.markRead();
    console.log(`[Alert] Alert ${alertId} transitioned to READ.`);

    res.status(200).json({
      success: true,
      message: `Alert ${alertId} marked as READ.`,
      status: alert.status,
      data: alert,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const dismissAlert = async (req, res) => {
  try {
    const { alertId } = req.params;
    const alert = await Alert.findOne({ alertId });
    if (!alert) {
      return res.status(404).json({ success: false, error: `Alert ${alertId} not found.` });
    }

    // Method: dismiss() (State transition: UNREAD/READ -> DISMISSED)
    await alert.dismiss();
    console.log(`[Alert] Alert ${alertId} transitioned to DISMISSED.`);

    res.status(200).json({
      success: true,
      message: `Alert ${alertId} dismissed.`,
      status: alert.status,
      data: alert,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const createManualAlert = async (req, res) => {
  try {
    const { title, description, severity, sourceRef, sourceType } = req.body;
    const alertId = `ALT-${Date.now().toString().slice(-6)}`;
    const alert = await Alert.create({
      alertId,
      title,
      description,
      severity: severity || 'HIGH',
      status: 'UNREAD',
      sourceType: sourceType || 'SYSTEM',
      sourceRef: sourceRef || 'Manual Entry',
    });

    res.status(201).json({
      success: true,
      message: 'Alert generated successfully.',
      data: alert,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
