$(document).ready(function() {
    $('.action-btn').click(function() {
        const id = $(this).data('id');
        const status = $(this).data('status');
        $(this).prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i>');

        $.ajax({
            url: `/admin/providers/${id}/status`,
            type: 'PATCH',
            contentType: 'application/json',
            data: JSON.stringify({ status }),
            success: (res) => { if(res.success) location.reload(); else alert('Error updating provider'); },
            error: () => { alert('Server error'); $(this).prop('disabled', false); }
        });
    });
});
