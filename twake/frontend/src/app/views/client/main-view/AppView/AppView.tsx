import React, { FC } from 'react';
import Messages from 'app/views/applications/messages';
import Drive from 'app/views/applications/drive/drive';
import Calendar from 'app/views/applications/calendar/calendar-content';
import Tasks from 'app/views/applications/tasks/tasks';
import NoApp from '../NoApp';
import AppViewService from 'app/features/router/services/app-view-service';

type PropsType = {
  viewService: AppViewService;
  id: string;
  current_channelTab?: any;
  current_channel?: any;
};

const AppView: FC<PropsType> = props => {
  //Listen context and app_id changes
  props.viewService.useWatcher(() => {
    return [
      props.viewService.getConfiguration().app?.id,
      props.viewService.getConfiguration().context,
    ];
  });

  const configuration = props.viewService.getConfiguration();

  const channelCollection = configuration.collection;
  let channel = null;
  if (channelCollection) {
    if (channelCollection?.findOne) {
      channel = channelCollection.findOne({ id: props.id }, { withoutBackend: true });
    }
  }

  const app = props.viewService.getConfiguration().app;

  switch (app?.identity?.code) {
    case 'twake_drive':
      return <Drive options={configuration} />;
    case 'twake_calendar':
      return <Calendar options={configuration} />;
    case 'twake_tasks':
      return <Tasks channel={channel} options={configuration} />;
    case 'messages':
      return <Messages channel={channel} options={configuration} />;
    default:
      return <NoApp />;
  }
};
export default AppView;