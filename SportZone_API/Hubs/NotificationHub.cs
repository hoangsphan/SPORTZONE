using Microsoft.AspNetCore.SignalR;
using System.Security.Claims; 
using System.Threading.Tasks;
using System.Collections.Concurrent;
using System.Linq;

namespace SportZone_API.Hubs
{
    public class NotificationHub : Hub
    {
        private static readonly ConcurrentDictionary<string, string> _connectedUsers =
            new ConcurrentDictionary<string, string>();

        public override async Task OnConnectedAsync()
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var connectionId = Context.ConnectionId;
            if (!string.IsNullOrEmpty(userId))
            {
                _connectedUsers[userId] = connectionId;
                var roleId = Context.User?.FindFirst("Role")?.Value;
                if (roleId == "3") 
                {
                    await Groups.AddToGroupAsync(connectionId, "Admin");
                }
            }
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var connectionId = Context.ConnectionId;

            if (!string.IsNullOrEmpty(userId))
            {
                _connectedUsers.TryRemove(userId, out _);
                var roleId = Context.User?.FindFirst("Role")?.Value;
                if (roleId == "3")
                {
                    await Groups.RemoveFromGroupAsync(connectionId, "Admin");
                }
            }
            await base.OnDisconnectedAsync(exception);
        }

        public async Task JoinFacilityGroup(string facilityId)
        {
            if (!string.IsNullOrEmpty(facilityId))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, $"facility-{facilityId}");
            }
        }

        public async Task LeaveFacilityGroup(string facilityId)
        {
            if (!string.IsNullOrEmpty(facilityId))
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"facility-{facilityId}");
            }
        }

        public async Task SendNotificationToClient(string connectionId, string message)
        {
            await Clients.Client(connectionId).SendAsync("ReceiveNotification", message);
        }

        public async Task SendNotificationToGroup(string groupName, string message)
        {
            await Clients.Group(groupName).SendAsync("ReceiveNotification", message);
        }
    }
}