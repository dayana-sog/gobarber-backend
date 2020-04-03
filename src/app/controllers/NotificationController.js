import Notification from '../schemas/Notification';
import User from '../models/User';

class NotificationController {
  async index(req, res) {
    const isProvider = await User.findOne({
      where: {
        id: req.userId,
        provider: true,
      },
    });

    if (!isProvider) {
      return res
        .status(401)
        .json({ error: 'Only providers can load notifications' });
    }

    const notification = await Notification.find({
      user: req.userId,
    })
      .sort({ createdAt: 'desc' })
      .limit(20);

    return res.json(notification);
  }

  async update(req, res) {
    // const notifications = await Notification.findById({});

    const notifications = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true } // Retornar a notificação atualizada.
    );

    return res.json(notifications);
  }
}

export default new NotificationController();