$(document).ready(function() {
    $('.delete-btn').click(function() {
        if (!confirm("Are you sure you want to permanently delete this review?")) return;

        const $btn = $(this);
        const id = $btn.data('id');
        $btn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i>');

        $.ajax({
            url: `/admin/reviews/${id}`,
            type: 'DELETE',
            success: (res) => { if(res.success) location.reload(); else alert('Failed to delete review'); },
            error: () => { alert('Server error'); $btn.prop('disabled', false).html('<i class="fas fa-trash"></i>'); }
        });
    });
});
