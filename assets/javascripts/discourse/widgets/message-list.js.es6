import { createWidget } from 'discourse/widgets/widget';
import { getCurrentUserMessages } from '../lib/user-messages';
import { h } from 'virtual-dom';
import RawHtml from 'discourse/widgets/raw-html';
import { emojiUnescape } from 'discourse/lib/text';
import I18n from "I18n";

export default createWidget('message-list', {
  tagName: 'div.message-list',
  buildKey: () => 'message-list',

  defaultState() {
    return {
      messages: null,
      loading: false
    };
  },

  messagesChanged() {
    this.refreshMessages(this.state);
  },

  refreshMessages(state) {
    if (this.loading) { return; }
    state.loading = true;
    getCurrentUserMessages(this).then((result) => {
      if (result.length) {
        let messages = result.slice(0,7);

        messages.forEach((m) => {
          if (m.last_read_post_number < m.highest_post_number) {
            m.set('unread', true);
            m.set('newCount', m.highest_post_number - m.last_read_post_number);
          }
          if (m.message_excerpt) {
            let excerpt = new RawHtml({
              html: `<div class='message-excerpt'>${emojiUnescape(m.message_excerpt)}</div>`
            });
            m.set('excerpt', excerpt);
          }
          state.messages = messages;
        });
      } else {
        state.messages = 'empty';
      }
      state.loading = false;
      this.scheduleRerender();
    });
  },

  html(attrs, state) {
    if (!state.messages) {
      this.refreshMessages(state);
    }
    const result = [];
    if (state.loading) {
      result.push(h('div.spinner-container', h('div.spinner')));
    } else if (state.messages !== 'empty') {
      const messageItems = state.messages.map(m => this.attach('message-item', m));
      result.push(h('ul', [messageItems]));
    } else {
      result.push(h('div.no-messages', I18n.t(`user.no_quick_messages`)));
    }
    return result;
  }
});
